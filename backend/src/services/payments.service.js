const { Payment, SalesInvoice, Contact, PaymentAllocation } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { AppError } = require('../utils/appError');

class PaymentsService {
  /**
   * Get all payments with filtering and pagination
   */
  async getPayments(organizationId, query = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      paymentMethod = '',
      contactId = '',
      startDate = '',
      endDate = '',
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = { organizationId };
    
    if (type) {
      whereConditions.type = type;
    }
    
    if (paymentMethod) {
      whereConditions.paymentMethod = paymentMethod;
    }
    
    if (contactId) {
      whereConditions.contactId = contactId;
    }

    if (startDate && endDate) {
      whereConditions.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.paymentDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.paymentDate = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Build search conditions
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { reference: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }
      );
    }

    if (searchConditions.length > 0) {
      whereConditions[Op.or] = searchConditions;
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: SalesInvoice,
          as: 'salesInvoice',
          attributes: ['id', 'invoiceNumber', 'totalAmount', 'status']
        },
        {
          model: PaymentAllocation,
          as: 'allocations',
          include: [
            {
              model: SalesInvoice,
              as: 'invoice',
              attributes: ['id', 'invoiceNumber', 'totalAmount']
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    return {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get payment statistics for dashboard
   */
  async getPaymentStatistics(organizationId) {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Total payments count
    const totalPayments = await Payment.count({
      where: { organizationId }
    });

    // Total received amount
    const totalReceived = await Payment.sum('amount', {
      where: {
        organizationId,
        type: 'received'
      }
    }) || 0;

    // Total paid amount
    const totalPaid = await Payment.sum('amount', {
      where: {
        organizationId,
        type: 'paid'
      }
    }) || 0;

    // This month's received payments
    const thisMonthReceived = await Payment.sum('amount', {
      where: {
        organizationId,
        type: 'received',
        paymentDate: { [Op.gte]: currentMonth }
      }
    }) || 0;

    // This month's paid payments
    const thisMonthPaid = await Payment.sum('amount', {
      where: {
        organizationId,
        type: 'paid',
        paymentDate: { [Op.gte]: currentMonth }
      }
    }) || 0;

    // Last month's received payments for comparison
    const lastMonthReceived = await Payment.sum('amount', {
      where: {
        organizationId,
        type: 'received',
        paymentDate: {
          [Op.gte]: lastMonth,
          [Op.lt]: currentMonth
        }
      }
    }) || 0;

    // Calculate growth percentage
    const receivedGrowth = lastMonthReceived > 0 
      ? ((thisMonthReceived - lastMonthReceived) / lastMonthReceived * 100).toFixed(1)
      : 0;

    // Unallocated payments (payments without allocations)
    const unallocatedPayments = await Payment.count({
      where: {
        organizationId,
        type: 'received'
      },
      include: [
        {
          model: PaymentAllocation,
          as: 'allocations',
          required: false
        }
      ],
      having: Sequelize.literal('COUNT(allocations.id) = 0')
    });

    // Payment methods breakdown
    const paymentMethodStats = await Payment.findAll({
      where: { organizationId },
      attributes: [
        'paymentMethod',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
      ],
      group: ['paymentMethod'],
      order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']]
    });

    return {
      totalPayments,
      totalReceived,
      totalPaid,
      netAmount: totalReceived - totalPaid,
      thisMonthReceived,
      thisMonthPaid,
      receivedGrowth: parseFloat(receivedGrowth),
      unallocatedPayments,
      paymentMethodStats: paymentMethodStats.map(stat => ({
        method: stat.paymentMethod,
        count: parseInt(stat.dataValues.count),
        total: parseFloat(stat.dataValues.total || 0)
      }))
    };
  }

  /**
   * Create new payment
   */
  async createPayment(paymentData, organizationId) {
    const {
      contactId,
      amount,
      paymentDate,
      paymentMethod,
      reference,
      notes,
      type = 'received',
      salesInvoiceId,
      allocations = []
    } = paymentData;

    // Validate contact exists
    const contact = await Contact.findOne({
      where: { id: contactId, organizationId }
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    // If specific invoice is mentioned, validate it
    if (salesInvoiceId) {
      const invoice = await SalesInvoice.findOne({
        where: { id: salesInvoiceId, organizationId, contactId }
      });

      if (!invoice) {
        throw new AppError('Invoice not found for this contact', 404);
      }
    }

    // Validate allocation amounts don't exceed payment amount
    if (allocations.length > 0) {
      const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      if (totalAllocated > amount) {
        throw new AppError('Total allocated amount cannot exceed payment amount', 400);
      }
    }

    // Create payment
    const payment = await Payment.create({
      organizationId,
      contactId,
      salesInvoiceId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      reference,
      notes,
      type
    });

    // Create allocations if provided
    if (allocations.length > 0) {
      for (const allocation of allocations) {
        await PaymentAllocation.create({
          paymentId: payment.id,
          salesInvoiceId: allocation.invoiceId,
          amount: allocation.amount
        });

        // Update invoice paid amount and status
        await this.updateInvoicePaymentStatus(allocation.invoiceId, organizationId);
      }
    } else if (salesInvoiceId) {
      // Auto-allocate to the specific invoice
      await PaymentAllocation.create({
        paymentId: payment.id,
        salesInvoiceId,
        amount
      });

      // Update invoice paid amount and status
      await this.updateInvoicePaymentStatus(salesInvoiceId, organizationId);
    }

    return await this.getPaymentById(payment.id, organizationId);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId, organizationId) {
    const payment = await Payment.findOne({
      where: { id: paymentId, organizationId },
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: SalesInvoice,
          as: 'salesInvoice',
          attributes: ['id', 'invoiceNumber', 'totalAmount', 'status']
        },
        {
          model: PaymentAllocation,
          as: 'allocations',
          include: [
            {
              model: SalesInvoice,
              as: 'invoice',
              attributes: ['id', 'invoiceNumber', 'totalAmount', 'paidAmount', 'status']
            }
          ]
        }
      ]
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  /**
   * Update payment
   */
  async updatePayment(paymentId, updateData, organizationId) {
    const payment = await Payment.findOne({
      where: { id: paymentId, organizationId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const {
      contactId,
      amount,
      paymentDate,
      paymentMethod,
      reference,
      notes,
      allocations
    } = updateData;

    // Update basic payment data
    await payment.update({
      contactId: contactId || payment.contactId,
      amount: amount || payment.amount,
      paymentDate: paymentDate || payment.paymentDate,
      paymentMethod: paymentMethod || payment.paymentMethod,
      reference: reference || payment.reference,
      notes: notes || payment.notes
    });

    // Update allocations if provided
    if (allocations && allocations.length > 0) {
      // Remove existing allocations
      const existingAllocations = await PaymentAllocation.findAll({
        where: { paymentId: payment.id }
      });

      for (const allocation of existingAllocations) {
        await allocation.destroy();
        // Recalculate invoice payment status
        await this.updateInvoicePaymentStatus(allocation.salesInvoiceId, organizationId);
      }

      // Create new allocations
      for (const allocation of allocations) {
        await PaymentAllocation.create({
          paymentId: payment.id,
          salesInvoiceId: allocation.invoiceId,
          amount: allocation.amount
        });

        // Update invoice payment status
        await this.updateInvoicePaymentStatus(allocation.invoiceId, organizationId);
      }
    }

    return await this.getPaymentById(payment.id, organizationId);
  }

  /**
   * Allocate payment to invoices
   */
  async allocatePayment(paymentId, allocations, organizationId) {
    const payment = await Payment.findOne({
      where: { id: paymentId, organizationId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Validate allocation amounts
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    if (totalAllocated > payment.amount) {
      throw new AppError('Total allocated amount cannot exceed payment amount', 400);
    }

    // Remove existing allocations
    const existingAllocations = await PaymentAllocation.findAll({
      where: { paymentId: payment.id }
    });

    for (const allocation of existingAllocations) {
      await allocation.destroy();
      // Recalculate invoice payment status
      await this.updateInvoicePaymentStatus(allocation.salesInvoiceId, organizationId);
    }

    // Create new allocations
    for (const allocation of allocations) {
      // Validate invoice exists and belongs to same contact
      const invoice = await SalesInvoice.findOne({
        where: {
          id: allocation.invoiceId,
          organizationId,
          contactId: payment.contactId
        }
      });

      if (!invoice) {
        throw new AppError(`Invoice ${allocation.invoiceId} not found for this contact`, 404);
      }

      await PaymentAllocation.create({
        paymentId: payment.id,
        salesInvoiceId: allocation.invoiceId,
        amount: allocation.amount
      });

      // Update invoice payment status
      await this.updateInvoicePaymentStatus(allocation.invoiceId, organizationId);
    }

    return await this.getPaymentById(payment.id, organizationId);
  }

  /**
   * Delete payment
   */
  async deletePayment(paymentId, organizationId) {
    const payment = await Payment.findOne({
      where: { id: paymentId, organizationId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Remove allocations first and update invoice statuses
    const allocations = await PaymentAllocation.findAll({
      where: { paymentId: payment.id }
    });

    for (const allocation of allocations) {
      await allocation.destroy();
      // Recalculate invoice payment status
      await this.updateInvoicePaymentStatus(allocation.salesInvoiceId, organizationId);
    }

    // Delete payment
    await payment.destroy();

    return { message: 'Payment deleted successfully' };
  }

  /**
   * Get unallocated payments for a contact
   */
  async getUnallocatedPayments(contactId, organizationId) {
    const payments = await Payment.findAll({
      where: {
        organizationId,
        contactId,
        type: 'received'
      },
      include: [
        {
          model: PaymentAllocation,
          as: 'allocations',
          required: false
        }
      ]
    });

    // Filter payments that have unallocated amounts
    const unallocatedPayments = payments.filter(payment => {
      const totalAllocated = payment.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      return totalAllocated < payment.amount;
    }).map(payment => {
      const totalAllocated = payment.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      return {
        ...payment.toJSON(),
        unallocatedAmount: payment.amount - totalAllocated
      };
    });

    return unallocatedPayments;
  }

  /**
   * Get outstanding invoices for a contact
   */
  async getOutstandingInvoices(contactId, organizationId) {
    const invoices = await SalesInvoice.findAll({
      where: {
        organizationId,
        contactId,
        status: { [Op.in]: ['sent', 'partial'] }
      },
      attributes: ['id', 'invoiceNumber', 'invoiceDate', 'dueDate', 'totalAmount', 'paidAmount', 'status'],
      order: [['dueDate', 'ASC']]
    });

    return invoices.map(invoice => ({
      ...invoice.toJSON(),
      outstandingAmount: invoice.totalAmount - invoice.paidAmount
    }));
  }

  /**
   * Update invoice payment status based on allocations
   */
  async updateInvoicePaymentStatus(invoiceId, organizationId) {
    const invoice = await SalesInvoice.findOne({
      where: { id: invoiceId, organizationId }
    });

    if (!invoice) return;

    // Calculate total allocated amount
    const totalAllocated = await PaymentAllocation.sum('amount', {
      where: { salesInvoiceId: invoiceId }
    }) || 0;

    // Update invoice paid amount and status
    let status = invoice.status;
    if (totalAllocated >= invoice.totalAmount) {
      status = 'paid';
    } else if (totalAllocated > 0) {
      status = 'partial';
    } else if (invoice.status === 'partial' || invoice.status === 'paid') {
      status = 'sent';
    }

    await invoice.update({
      paidAmount: totalAllocated,
      status
    });
  }
}

module.exports = new PaymentsService();