const express = require('express');
const productCategoriesController = require('../controllers/productCategories.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateOrganization } = require('../middleware/organization.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryQuerySchema 
} = require('../validations/productCategories.validation');

const router = express.Router();

// Apply authentication and organization validation to all routes
router.use(authenticate);
router.use(validateOrganization);

/**
 * @route   POST /api/v1/product-categories
 * @desc    Create a new product category
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createCategorySchema),
  productCategoriesController.createCategory
);

/**
 * @route   GET /api/v1/product-categories
 * @desc    Get all categories with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validateRequest(categoryQuerySchema, 'query'),
  productCategoriesController.getCategories
);

/**
 * @route   GET /api/v1/product-categories/tree
 * @desc    Get category tree structure
 * @access  Private
 */
router.get('/tree', productCategoriesController.getCategoryTree);

/**
 * @route   GET /api/v1/product-categories/stats
 * @desc    Get category statistics
 * @access  Private
 */
router.get('/stats', productCategoriesController.getCategoryStats);

/**
 * @route   GET /api/v1/product-categories/:id
 * @desc    Get category by ID
 * @access  Private
 */
router.get('/:id', productCategoriesController.getCategoryById);

/**
 * @route   PUT /api/v1/product-categories/:id
 * @desc    Update category
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(updateCategorySchema),
  productCategoriesController.updateCategory
);

/**
 * @route   DELETE /api/v1/product-categories/:id
 * @desc    Delete category (soft delete)
 * @access  Private
 */
router.delete('/:id', productCategoriesController.deleteCategory);

module.exports = router;