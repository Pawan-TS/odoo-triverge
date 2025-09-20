const express = require('express');
const productsController = require('../controllers/products.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateOrganization } = require('../middleware/organization.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema,
  stockUpdateSchema 
} = require('../validations/products.validation');

const router = express.Router();

// Apply authentication and organization validation to all routes
router.use(authenticate);
router.use(validateOrganization);

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createProductSchema),
  productsController.createProduct
);

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validateRequest(productQuerySchema, 'query'),
  productsController.getProducts
);

/**
 * @route   GET /api/v1/products/stats
 * @desc    Get product statistics
 * @access  Private
 */
router.get('/stats', productsController.getProductStats);

/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get low stock products
 * @access  Private
 */
router.get('/low-stock', productsController.getLowStockProducts);

/**
 * @route   GET /api/v1/products/code/:code
 * @desc    Get product by code
 * @access  Private
 */
router.get('/code/:code', productsController.getProductByCode);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', productsController.getProductById);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(updateProductSchema),
  productsController.updateProduct
);

/**
 * @route   PUT /api/v1/products/:id/stock
 * @desc    Update product stock
 * @access  Private
 */
router.put(
  '/:id/stock',
  validateRequest(stockUpdateSchema),
  productsController.updateStock
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private
 */
router.delete('/:id', productsController.deleteProduct);

module.exports = router;