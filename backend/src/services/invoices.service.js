const { SalesOrder, SalesInvoice, SalesInvoiceLine, Contact, Product, Payment } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { AppError } = require('../utils/appError');

class InvoicesService {
  /**
   * Get all invoices with filtering and pagination
   */
  async getInvoices(organizationId, query = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      contactId = '',
      sortBy = 'invoiceDate',
      sortOrder = 'desc'
    } = query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = { organizationId };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (contactId) {
      whereConditions.contactId = contactId;
    }

    // Build search conditions
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { reference: { [Op.like]: `%${search}%` } }
      );
    }

    if (searchConditions.length > 0) {
      whereConditions[Op.or] = searchConditions;
    }

    const { count, rows: invoices } = await SalesInvoice.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'orderNumber', 'orderDate']
        },
        {
          model: SalesInvoiceLine,
          as: 'lines',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku']
            }
          ]
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'paymentDate', 'paymentMethod', 'reference']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    return {
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get invoice statistics for dashboard
   */
  async getInvoiceStatistics(organizationId) {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Total invoices count
    const totalInvoices = await SalesInvoice.count({
      where: { organizationId }
    });

    // Pending invoices (draft, sent, partial)
    const pendingInvoices = await SalesInvoice.count({
      where: {
        organizationId,
        status: { [Op.in]: ['draft', 'sent', 'partial'] }
      }
    });

    // Overdue invoices
    const overdueInvoices = await SalesInvoice.count({
      where: {
        organizationId,
        status: { [Op.in]: ['sent', 'partial'] },
        dueDate: { [Op.lt]: currentDate }
      }
    });

    // Total revenue (paid invoices)
    const totalRevenue = await SalesInvoice.sum('totalAmount', {
      where: {
        organizationId,
        status: 'paid'
      }
    }) || 0;

    // Outstanding amount (unpaid invoices)
    const outstandingAmount = await SalesInvoice.sum('totalAmount', {
      where: {
        organizationId,
        status: { [Op.in]: ['sent', 'partial'] }
      }
    }) || 0;

    // This month's invoices
    const thisMonthInvoices = await SalesInvoice.count({
      where: {
        organizationId,
        invoiceDate: { [Op.gte]: currentMonth }
      }
    });

    // This month's revenue
    const thisMonthRevenue = await SalesInvoice.sum('totalAmount', {
      where: {
        organizationId,
        status: 'paid',
        invoiceDate: { [Op.gte]: currentMonth }
      }
    }) || 0;

    // Last month's revenue for comparison
    const lastMonthRevenue = await SalesInvoice.sum('totalAmount', {
      where: {
        organizationId,
        status: 'paid',
        invoiceDate: {
          [Op.gte]: lastMonth,
          [Op.lt]: currentMonth
        }
      }
    }) || 0;

    // Calculate growth percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    return {
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      outstandingAmount,
      thisMonthInvoices,
      thisMonthRevenue,
      revenueGrowth: parseFloat(revenueGrowth)
    };
  }

  /**
   * Create new invoice
   */
  async createInvoice(invoiceData, organizationId) {
    const {
      contactId,
      salesOrderId,
      invoiceDate,
      dueDate,
      reference,
      notes,
      lines = []
    } = invoiceData;

    // Validate contact exists
    const contact = await Contact.findOne({
      where: { id: contactId, organizationId }
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    // If creating from sales order, validate it exists
    let salesOrder = null;
    if (salesOrderId) {
      salesOrder = await SalesOrder.findOne({
        where: { id: salesOrderId, organizationId, status: 'confirmed' }
      });

      if (!salesOrder) {
        throw new AppError('Sales order not found or not confirmed', 404);
      }
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;

    for (const line of lines) {
      const lineSubtotal = line.quantity * line.unitPrice;
      const lineDiscount = (lineSubtotal * (line.discount || 0)) / 100;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = (lineAfterDiscount * (line.taxRate || 0)) / 100;
      
      subtotal += lineAfterDiscount;
      totalTax += lineTax;
    }

    const totalAmount = subtotal + totalTax;

    // Create invoice
    const invoice = await SalesInvoice.create({
      organizationId,
      contactId,
      salesOrderId,
      invoiceNumber,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      reference,
      notes,
      subtotal,
      totalTax,
      totalAmount,
      paidAmount: 0,
      status: 'draft'
    });

    // Create invoice lines
    for (const lineData of lines) {
      const lineSubtotal = lineData.quantity * lineData.unitPrice;
      const lineDiscount = (lineSubtotal * (lineData.discount || 0)) / 100;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = (lineAfterDiscount * (lineData.taxRate || 0)) / 100;

      await SalesInvoiceLine.create({
        salesInvoiceId: invoice.id,
        productId: lineData.productId,
        description: lineData.description,
        quantity: lineData.quantity,
        unitPrice: lineData.unitPrice,
        discount: lineData.discount || 0,
        taxRate: lineData.taxRate || 0,
        taxAmount: lineTax,
        subtotal: lineAfterDiscount
      });
    }

    // Return invoice with relations
    return await this.getInvoiceById(invoice.id, organizationId);
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId, organizationId) {
    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId },
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'orderNumber', 'orderDate']
        },
        {
          model: SalesInvoiceLine,
          as: 'lines',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'description']
            }
          ]
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'paymentDate', 'paymentMethod', 'reference', 'notes']
        }
      ]
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId, updateData, organizationId) {
    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Only allow updates if invoice is in draft status
    if (invoice.status !== 'draft') {
      throw new AppError('Only draft invoices can be updated', 400);
    }

    const {
      contactId,
      invoiceDate,
      dueDate,
      reference,
      notes,
      lines = []
    } = updateData;

    // Update basic invoice data
    await invoice.update({
      contactId: contactId || invoice.contactId,
      invoiceDate: invoiceDate || invoice.invoiceDate,
      dueDate: dueDate || invoice.dueDate,
      reference: reference || invoice.reference,
      notes: notes || invoice.notes
    });

    // If lines are provided, update them
    if (lines.length > 0) {
      // Delete existing lines
      await SalesInvoiceLine.destroy({
        where: { salesInvoiceId: invoice.id }
      });

      // Calculate new totals
      let subtotal = 0;
      let totalTax = 0;

      // Create new lines
      for (const lineData of lines) {
        const lineSubtotal = lineData.quantity * lineData.unitPrice;
        const lineDiscount = (lineSubtotal * (lineData.discount || 0)) / 100;
        const lineAfterDiscount = lineSubtotal - lineDiscount;
        const lineTax = (lineAfterDiscount * (lineData.taxRate || 0)) / 100;
        
        subtotal += lineAfterDiscount;
        totalTax += lineTax;

        await SalesInvoiceLine.create({
          salesInvoiceId: invoice.id,
          productId: lineData.productId,
          description: lineData.description,
          quantity: lineData.quantity,
          unitPrice: lineData.unitPrice,
          discount: lineData.discount || 0,
          taxRate: lineData.taxRate || 0,
          taxAmount: lineTax,
          subtotal: lineAfterDiscount
        });
      }

      // Update invoice totals
      await invoice.update({
        subtotal,
        totalTax,
        totalAmount: subtotal + totalTax
      });
    }

    return await this.getInvoiceById(invoice.id, organizationId);
  }

  /**
   * Send invoice (change status to sent)
   */
  async sendInvoice(invoiceId, organizationId) {
    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status !== 'draft') {
      throw new AppError('Only draft invoices can be sent', 400);
    }

    await invoice.update({
      status: 'sent',
      sentDate: new Date()
    });

    return await this.getInvoiceById(invoice.id, organizationId);
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(invoiceId, paymentData, organizationId) {
    const { amount, paymentDate, paymentMethod, reference, notes } = paymentData;

    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status === 'cancelled') {
      throw new AppError('Cannot record payment for cancelled invoice', 400);
    }

    // Check if payment amount is valid
    const remainingAmount = invoice.totalAmount - invoice.paidAmount;
    if (amount > remainingAmount) {
      throw new AppError('Payment amount exceeds remaining balance', 400);
    }

    // Create payment record
    const payment = await Payment.create({
      organizationId,
      contactId: invoice.contactId,
      salesInvoiceId: invoice.id,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      reference,
      notes,
      type: 'received'
    });

    // Update invoice paid amount and status
    const newPaidAmount = invoice.paidAmount + amount;
    let newStatus = invoice.status;

    if (newPaidAmount >= invoice.totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    await invoice.update({
      paidAmount: newPaidAmount,
      status: newStatus
    });

    return {
      payment,
      invoice: await this.getInvoiceById(invoice.id, organizationId)
    };
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId, organizationId) {
    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status === 'paid') {
      throw new AppError('Cannot cancel paid invoice', 400);
    }

    if (invoice.paidAmount > 0) {
      throw new AppError('Cannot cancel invoice with partial payments', 400);
    }

    await invoice.update({
      status: 'cancelled',
      cancelledDate: new Date()
    });

    return await this.getInvoiceById(invoice.id, organizationId);
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(invoiceId, organizationId) {
    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status !== 'draft') {
      throw new AppError('Only draft invoices can be deleted', 400);
    }

    // Delete related lines first
    await SalesInvoiceLine.destroy({
      where: { salesInvoiceId: invoice.id }
    });

    // Delete invoice
    await invoice.destroy();

    return { message: 'Invoice deleted successfully' };
  }

  /**
   * Generate invoice number
   */
  async generateInvoiceNumber(organizationId) {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;
    
    // Find the last invoice number for current year
    const lastInvoice = await SalesInvoice.findOne({
      where: {
        organizationId,
        invoiceNumber: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['invoiceNumber', 'DESC']]
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }
}

module.exports = new InvoicesService();