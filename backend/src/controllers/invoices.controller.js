const invoicesService = require('../services/invoices.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class InvoicesController {
  /**
   * Get all invoices with filtering
   */
  async getInvoices(req, res, next) {
    try {
      const result = await invoicesService.getInvoices(
        req.user.organizationId,
        req.query
      );
      
      return sendSuccessResponse(res, result, 'Invoices retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStatistics(req, res, next) {
    try {
      const statistics = await invoicesService.getInvoiceStatistics(
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, statistics, 'Invoice statistics retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(req, res, next) {
    try {
      const invoice = await invoicesService.createInvoice(
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, invoice, 'Invoice created successfully', 201);
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoicesService.getInvoiceById(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, invoice, 'Invoice retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(req, res, next) {
    try {
      const invoice = await invoicesService.updateInvoice(
        req.params.id,
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, invoice, 'Invoice updated successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Send invoice
   */
  async sendInvoice(req, res, next) {
    try {
      const invoice = await invoicesService.sendInvoice(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, invoice, 'Invoice sent successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(req, res, next) {
    try {
      const result = await invoicesService.recordPayment(
        req.params.id,
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, result, 'Payment recorded successfully', 201);
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(req, res, next) {
    try {
      const invoice = await invoicesService.cancelInvoice(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, invoice, 'Invoice cancelled successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(req, res, next) {
    try {
      const result = await invoicesService.deleteInvoice(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, result, 'Invoice deleted successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new InvoicesController();