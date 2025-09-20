const TaxService = require('../services/taxes.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class TaxesController {
  /**
   * Create a new tax
   */
  async createTax(req, res, next) {
    try {
      const { organizationId } = req.user;
      const tax = await TaxService.createTax(req.body, organizationId);
      
      return sendSuccessResponse(res, 201, 'Tax created successfully', tax);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all taxes with pagination and filtering
   */
  async getTaxes(req, res, next) {
    try {
      const { organizationId } = req.user;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        taxType: req.query.taxType,
        isActive: req.query.isActive,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await TaxService.getTaxes(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Taxes retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get tax by ID
   */
  async getTaxById(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const tax = await TaxService.getTaxById(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Tax retrieved successfully', tax);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get tax by code
   */
  async getTaxByCode(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { code } = req.params;
      
      const tax = await TaxService.getTaxByCode(code, organizationId);
      
      return sendSuccessResponse(res, 200, 'Tax retrieved successfully', tax);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update tax
   */
  async updateTax(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const tax = await TaxService.updateTax(id, req.body, organizationId);
      
      return sendSuccessResponse(res, 200, 'Tax updated successfully', tax);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete tax
   */
  async deleteTax(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const result = await TaxService.deleteTax(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Tax deleted successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get active taxes for dropdowns
   */
  async getActiveTaxes(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const taxes = await TaxService.getActiveTaxes(organizationId);
      
      return sendSuccessResponse(res, 200, 'Active taxes retrieved successfully', taxes);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Calculate tax amount
   */
  async calculateTax(req, res, next) {
    try {
      const { baseAmount, taxRate, taxType } = req.body;
      
      const calculation = TaxService.calculateTaxAmount(baseAmount, taxRate, taxType);
      
      return sendSuccessResponse(res, 200, 'Tax calculated successfully', calculation);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get tax statistics
   */
  async getTaxStats(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const stats = await TaxService.getTaxStats(organizationId);
      
      return sendSuccessResponse(res, 200, 'Tax statistics retrieved successfully', stats);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Create default taxes
   */
  async createDefaultTaxes(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const result = await TaxService.createDefaultTaxes(organizationId);
      
      return sendSuccessResponse(res, 200, 'Default taxes created successfully', result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TaxesController();
