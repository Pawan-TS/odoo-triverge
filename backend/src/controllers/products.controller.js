const productsService = require('../services/products.service');
const { successResponse, errorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class ProductsController {
  /**
   * Create a new product
   */
  async createProduct(req, res, next) {
    try {
      const { organizationId } = req.user;
      const product = await productsService.createProduct(req.body, organizationId);
      
      return successResponse(res, product, 'Product created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(req, res, next) {
    try {
      const { organizationId } = req.user;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        categoryId: req.query.categoryId,
        productType: req.query.productType,
        isActive: req.query.isActive,
        lowStock: req.query.lowStock,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await productsService.getProducts(organizationId, options);
      
      return successResponse(res, result, 'Products retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const product = await productsService.getProductById(id, organizationId);
      
      return successResponse(res, product, 'Product retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get product by code
   */
  async getProductByCode(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { code } = req.params;
      
      const product = await productsService.getProductByCode(code, organizationId);
      
      return successResponse(res, product, 'Product retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update product
   */
  async updateProduct(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const product = await productsService.updateProduct(id, req.body, organizationId);
      
      return successResponse(res, product, 'Product updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const result = await productsService.deleteProduct(id, organizationId);
      
      return successResponse(res, result, 'Product deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update product stock
   */
  async updateStock(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      const { quantity, type, notes } = req.body;
      
      const product = await productsService.updateStock(id, quantity, type, organizationId, notes);
      
      return successResponse(res, product, 'Stock updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const products = await productsService.getLowStockProducts(organizationId);
      
      return successResponse(res, products, 'Low stock products retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const stats = await productsService.getProductStats(organizationId);
      
      return successResponse(res, stats, 'Product statistics retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ProductsController();