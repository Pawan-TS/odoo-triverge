const taxesService = require('../services/taxes.service');
const { successResponse, errorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class TaxesController {
  /**
   * Create a new tax
   */
  async createTax(req, res, next) {
    try {
      const { organizationId } = req.user;
      const tax = await taxesService.createTax(req.body, organizationId);
      
      return successResponse(res, tax, 'Tax created successfully', 201);
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

      const result = await taxesService.getTaxes(organizationId, options);
      
      return successResponse(res, result, 'Taxes retrieved successfully');
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
      
      const tax = await taxesService.getTaxById(id, organizationId);
      
      return successResponse(res, tax, 'Tax retrieved successfully');
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
      
      const tax = await taxesService.getTaxByCode(code, organizationId);
      
      return successResponse(res, tax, 'Tax retrieved successfully');
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
      
      const tax = await taxesService.updateTax(id, req.body, organizationId);
      
      return successResponse(res, tax, 'Tax updated successfully');
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
      
      const result = await taxesService.deleteTax(id, organizationId);
      
      return successResponse(res, result, 'Tax deleted successfully');
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
      
      const taxes = await taxesService.getActiveTaxes(organizationId);
      
      return successResponse(res, taxes, 'Active taxes retrieved successfully');
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
      
      const calculation = taxesService.calculateTaxAmount(baseAmount, taxRate, taxType);
      
      return successResponse(res, calculation, 'Tax calculated successfully');
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
      
      const stats = await taxesService.getTaxStats(organizationId);
      
      return successResponse(res, stats, 'Tax statistics retrieved successfully');
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
      
      const result = await taxesService.createDefaultTaxes(organizationId);
      
      return successResponse(res, result, 'Default taxes created successfully');
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TaxesController();