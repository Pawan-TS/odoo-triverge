const { SalesOrder, SalesOrderLine, Contact, Product, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { generateDocumentNumber } = require('../utils/sequences');
const { Op } = require('sequelize');

class SalesOrderService {
  /**
   * Get sales orders with filtering and pagination
   */
  async getSalesOrders(organizationId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      contactId,
      dateFrom,
      dateTo,
      sortBy = 'orderDate',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = { organizationId };

    if (search) {
      whereConditions[Op.or] = [
        { documentNumber: { [Op.like]: `%${search}%` } },
        { '$Contact.contactName$': { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereConditions.status = status;
    }

    if (contactId) {
      whereConditions.contactId = contactId;
    }

    if (dateFrom || dateTo) {
      whereConditions.orderDate = {};
      if (dateFrom) whereConditions.orderDate[Op.gte] = dateFrom;
      if (dateTo) whereConditions.orderDate[Op.lte] = dateTo;
    }

    const { count, rows } = await SalesOrder.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'contactName', 'email', 'phone']
        },
        {
          model: SalesOrderLine,
          as: 'lines',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'productName', 'salePrice']
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      salesOrders: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  /**
   * Get sales order statistics
   */
  async getSalesOrderStatistics(organizationId) {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft_orders,
        COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'Invoiced' THEN 1 END) as invoiced_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('Confirmed', 'Invoiced') THEN total_amount ELSE 0 END), 0) as confirmed_revenue
      FROM sales_orders 
      WHERE organization_id = :organizationId
    `, {
      replacements: { organizationId },
      type: sequelize.QueryTypes.SELECT
    });

    const stats = results[0] || {
      total_orders: 0,
      draft_orders: 0,
      confirmed_orders: 0,
      invoiced_orders: 0,
      total_revenue: 0,
      confirmed_revenue: 0
    };

    return {
      totalOrders: parseInt(stats.total_orders),
      draftOrders: parseInt(stats.draft_orders),
      confirmedOrders: parseInt(stats.confirmed_orders),
      invoicedOrders: parseInt(stats.invoiced_orders),
      totalRevenue: parseFloat(stats.total_revenue),
      confirmedRevenue: parseFloat(stats.confirmed_revenue)
    };
  }

  /**
   * Create a new sales order
   */
  async createSalesOrder(data, organizationId) {
    const transaction = await sequelize.transaction();

    try {
      // Generate document number
      const { documentNumber } = await generateDocumentNumber(organizationId, 'SO');

      // Calculate totals
      let subtotal = 0;
      let totalTax = 0;

      for (const line of data.lines) {
        const lineSubtotal = line.quantity * line.unitPrice;
        const lineTax = lineSubtotal * (line.taxRate || 0) / 100;
        
        subtotal += lineSubtotal;
        totalTax += lineTax;
      }

      const totalAmount = subtotal + totalTax;

      // Create sales order
      const salesOrder = await SalesOrder.create({
        organizationId,
        contactId: data.contactId,
        documentNumber,
        orderDate: data.orderDate,
        status: 'Draft',
        subtotal,
        totalTax,
        totalAmount,
        notes: data.notes
      }, { transaction });

      // Create sales order lines
      const lines = await Promise.all(
        data.lines.map(line => 
          SalesOrderLine.create({
            salesOrderId: salesOrder.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxId: line.taxId,
            taxRate: line.taxRate || 0,
            subtotal: line.quantity * line.unitPrice,
            taxAmount: (line.quantity * line.unitPrice) * (line.taxRate || 0) / 100,
            totalAmount: (line.quantity * line.unitPrice) * (1 + (line.taxRate || 0) / 100)
          }, { transaction })
        )
      );

      await transaction.commit();

      // Return with includes
      return await this.getSalesOrderById(salesOrder.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get sales order by ID
   */
  async getSalesOrderById(id, organizationId) {
    const salesOrder = await SalesOrder.findOne({
      where: { id, organizationId },
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'contactName', 'email', 'phone']
        },
        {
          model: SalesOrderLine,
          as: 'lines',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'productName', 'salePrice']
            }
          ]
        }
      ]
    });

    if (!salesOrder) {
      throw new AppError('Sales order not found', 404);
    }

    return salesOrder;
  }

  /**
   * Update sales order
   */
  async updateSalesOrder(id, data, organizationId) {
    const transaction = await sequelize.transaction();

    try {
      const salesOrder = await SalesOrder.findOne({
        where: { id, organizationId }
      });

      if (!salesOrder) {
        throw new AppError('Sales order not found', 404);
      }

      if (salesOrder.status === 'Invoiced') {
        throw new AppError('Cannot update invoiced sales order', 400);
      }

      // Update sales order
      await salesOrder.update({
        contactId: data.contactId || salesOrder.contactId,
        orderDate: data.orderDate || salesOrder.orderDate,
        notes: data.notes !== undefined ? data.notes : salesOrder.notes
      }, { transaction });

      // Update lines if provided
      if (data.lines) {
        // Delete existing lines
        await SalesOrderLine.destroy({
          where: { salesOrderId: id },
          transaction
        });

        // Calculate new totals
        let subtotal = 0;
        let totalTax = 0;

        // Create new lines
        for (const line of data.lines) {
          const lineSubtotal = line.quantity * line.unitPrice;
          const lineTax = lineSubtotal * (line.taxRate || 0) / 100;
          
          subtotal += lineSubtotal;
          totalTax += lineTax;

          await SalesOrderLine.create({
            salesOrderId: id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxId: line.taxId,
            taxRate: line.taxRate || 0,
            subtotal: lineSubtotal,
            taxAmount: lineTax,
            totalAmount: lineSubtotal + lineTax
          }, { transaction });
        }

        // Update totals
        await salesOrder.update({
          subtotal,
          totalTax,
          totalAmount: subtotal + totalTax
        }, { transaction });
      }

      await transaction.commit();
      return await this.getSalesOrderById(id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Confirm sales order
   */
  async confirmSalesOrder(id, organizationId) {
    const salesOrder = await SalesOrder.findOne({
      where: { id, organizationId }
    });

    if (!salesOrder) {
      throw new AppError('Sales order not found', 404);
    }

    if (salesOrder.status !== 'Draft') {
      throw new AppError('Only draft orders can be confirmed', 400);
    }

    await salesOrder.update({ status: 'Confirmed' });
    return await this.getSalesOrderById(id, organizationId);
  }

  /**
   * Cancel sales order
   */
  async cancelSalesOrder(id, organizationId) {
    const salesOrder = await SalesOrder.findOne({
      where: { id, organizationId }
    });

    if (!salesOrder) {
      throw new AppError('Sales order not found', 404);
    }

    if (salesOrder.status === 'Invoiced') {
      throw new AppError('Cannot cancel invoiced sales order', 400);
    }

    await salesOrder.update({ status: 'Cancelled' });
    return await this.getSalesOrderById(id, organizationId);
  }

  /**
   * Delete sales order
   */
  async deleteSalesOrder(id, organizationId) {
    const transaction = await sequelize.transaction();

    try {
      const salesOrder = await SalesOrder.findOne({
        where: { id, organizationId }
      });

      if (!salesOrder) {
        throw new AppError('Sales order not found', 404);
      }

      if (salesOrder.status === 'Invoiced') {
        throw new AppError('Cannot delete invoiced sales order', 400);
      }

      // Delete lines first
      await SalesOrderLine.destroy({
        where: { salesOrderId: id },
        transaction
      });

      // Delete sales order
      await salesOrder.destroy({ transaction });

      await transaction.commit();
      return { message: 'Sales order deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new SalesOrderService();