const ProductService = require('../services/products.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class ProductsController {
  /**
   * Create a new product
   */
  async createProduct(req, res, next) {
    try {
      const { organizationId } = req.user;
      const product = await ProductService.createProduct(req.body, organizationId);
      
      return sendSuccessResponse(res, 201, 'Product created successfully', product);
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
        productType: req.query.type,  // Map 'type' query param to 'productType'
        isActive: req.query.isActive,
        lowStock: req.query.lowStock,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await ProductService.getProducts(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Products retrieved successfully', result);
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
      
      const product = await ProductService.getProductById(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product retrieved successfully', product);
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
      
      const product = await ProductService.getProductByCode(code, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product retrieved successfully', product);
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
      
      const product = await ProductService.updateProduct(id, req.body, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product updated successfully', product);
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
      
      const result = await ProductService.deleteProduct(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Product deleted successfully', result);
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
      
      const product = await ProductService.updateStock(id, quantity, type, organizationId, notes);
      
      return sendSuccessResponse(res, 200, 'Stock updated successfully', product);
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
      
      const products = await ProductService.getLowStockProducts(organizationId);
      
      return sendSuccessResponse(res, 200, 'Low stock products retrieved successfully', products);
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
      
      const stats = await ProductService.getProductStats(organizationId);
      
      return sendSuccessResponse(res, 200, 'Product statistics retrieved successfully', stats);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ProductsController();
