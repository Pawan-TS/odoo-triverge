const salesOrdersService = require('../services/salesOrders.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class SalesOrdersController {
  /**
   * Get all sales orders with filtering
   */
  async getSalesOrders(req, res, next) {
    try {
      const result = await salesOrdersService.getSalesOrders(
        req.user.organizationId,
        req.query
      );
      
      return sendSuccessResponse(res, result, 'Sales orders retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get sales order statistics
   */
  async getSalesOrderStatistics(req, res, next) {
    try {
      const statistics = await salesOrdersService.getSalesOrderStatistics(
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, statistics, 'Sales order statistics retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new sales order
   */
  async createSalesOrder(req, res, next) {
    try {
      const salesOrder = await salesOrdersService.createSalesOrder(
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, salesOrder, 'Sales order created successfully', 201);
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get sales order by ID
   */
  async getSalesOrderById(req, res, next) {
    try {
      const salesOrder = await salesOrdersService.getSalesOrderById(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, salesOrder, 'Sales order retrieved successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update sales order
   */
  async updateSalesOrder(req, res, next) {
    try {
      const salesOrder = await salesOrdersService.updateSalesOrder(
        req.params.id,
        req.body,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, salesOrder, 'Sales order updated successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Confirm sales order
   */
  async confirmSalesOrder(req, res, next) {
    try {
      const salesOrder = await salesOrdersService.confirmSalesOrder(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, salesOrder, 'Sales order confirmed successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Cancel sales order
   */
  async cancelSalesOrder(req, res, next) {
    try {
      const salesOrder = await salesOrdersService.cancelSalesOrder(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, salesOrder, 'Sales order cancelled successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete sales order
   */
  async deleteSalesOrder(req, res, next) {
    try {
      const result = await salesOrdersService.deleteSalesOrder(
        req.params.id,
        req.user.organizationId
      );
      
      return sendSuccessResponse(res, result, 'Sales order deleted successfully');
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new SalesOrdersController();