const productCategoriesService = require('../services/productCategories.service');
const { successResponse, errorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class ProductCategoriesController {
  /**
   * Create a new product category
   */
  async createCategory(req, res, next) {
    try {
      const { organizationId } = req.user;
      const category = await productCategoriesService.createCategory(req.body, organizationId);
      
      return successResponse(res, category, 'Product category created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all categories with pagination and filtering
   */
  async getCategories(req, res, next) {
    try {
      const { organizationId } = req.user;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        parentId: req.query.parentId,
        isActive: req.query.isActive,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        includeChildren: req.query.includeChildren
      };

      const result = await productCategoriesService.getCategories(organizationId, options);
      
      return successResponse(res, result, 'Product categories retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const category = await productCategoriesService.getCategoryById(id, organizationId);
      
      return successResponse(res, category, 'Product category retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update category
   */
  async updateCategory(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const category = await productCategoriesService.updateCategory(id, req.body, organizationId);
      
      return successResponse(res, category, 'Product category updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const result = await productCategoriesService.deleteCategory(id, organizationId);
      
      return successResponse(res, result, 'Product category deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get category tree structure
   */
  async getCategoryTree(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const tree = await productCategoriesService.getCategoryTree(organizationId);
      
      return successResponse(res, tree, 'Category tree retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const stats = await productCategoriesService.getCategoryStats(organizationId);
      
      return successResponse(res, stats, 'Category statistics retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ProductCategoriesController();