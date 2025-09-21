const paymentsService = require('../services/payments.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class PaymentsController {
  /**
   * Get all payments with filtering
   */
  async getPayments(req, res, next) {
    try {
      const result = await paymentsService.getPayments(
        req.user.organizationId,
        req.query
      );
      
      return sendSuccessResponse(res, result, 'Payments retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(req, res, next) {
    try {
      const statistics = await paymentsService.getPaymentStatistics(
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, statistics, 'Payment statistics retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new payment
   */
  async createPayment(req, res, next) {
    try {
      const payment = await paymentsService.createPayment(
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, payment, 'Payment created successfully', 201);
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentsService.getPaymentById(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, payment, 'Payment retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update payment
   */
  async updatePayment(req, res, next) {
    try {
      const payment = await paymentsService.updatePayment(
        req.params.id,
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, payment, 'Payment updated successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Allocate payment to invoices
   */
  async allocatePayment(req, res, next) {
    try {
      const payment = await paymentsService.allocatePayment(
        req.params.id,
        req.body.allocations,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, payment, 'Payment allocated successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(req, res, next) {
    try {
      const result = await paymentsService.deletePayment(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, result, 'Payment deleted successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get unallocated payments for a contact
   */
  async getUnallocatedPayments(req, res, next) {
    try {
      const payments = await paymentsService.getUnallocatedPayments(
        req.params.contactId,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, payments, 'Unallocated payments retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get outstanding invoices for a contact
   */
  async getOutstandingInvoices(req, res, next) {
    try {
      const invoices = await paymentsService.getOutstandingInvoices(
        req.params.contactId,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, invoices, 'Outstanding invoices retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new PaymentsController();