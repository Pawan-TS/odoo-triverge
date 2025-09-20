const ProductCategoryService = require('../services/productCategories.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class ProductCategoriesController {
  /**
   * Create a new product category
   */
  async createCategory(req, res, next) {
    try {
      const { organizationId } = req.user;
      const category = await ProductCategoryService.createCategory(req.body, organizationId);
      
      return sendSuccessResponse(res, 201, 'Product category created successfully', category);
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
        includeChildren: req.query.includeChildren || req.query.includeHierarchy
      };

      const result = await ProductCategoryService.getCategories(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Product categories retrieved successfully', result);
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
      
      const category = await ProductCategoryService.getCategoryById(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product category retrieved successfully', category);
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
      
      const category = await ProductCategoryService.updateCategory(id, req.body, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product category updated successfully', category);
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
      
      const result = await ProductCategoryService.deleteCategory(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product category deleted successfully', result);
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
      
      const tree = await ProductCategoryService.getCategoryTree(organizationId);
      
      return sendSuccessResponse(res, 200, 'Category tree retrieved successfully', tree);
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
      
      const stats = await ProductCategoryService.getCategoryStats(organizationId);
      
      return sendSuccessResponse(res, 200, 'Category statistics retrieved successfully', stats);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ProductCategoriesController();
