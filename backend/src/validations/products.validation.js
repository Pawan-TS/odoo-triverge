const Joi = require('joi');

// Base product schema
const productBaseSchema = {
  productName: Joi.string().trim().min(2).max(255).required()
    .messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 255 characters'
    }),
  
  productCode: Joi.string().trim().max(50).optional()
    .messages({
      'string.max': 'Product code cannot exceed 50 characters'
    }),

  productType: Joi.string().valid('goods', 'service').required()
    .messages({
      'any.only': 'Product type must be goods or service',
      'any.required': 'Product type is required'
    }),

  categoryId: Joi.number().integer().positive().optional()
    .messages({
      'number.positive': 'Category ID must be a positive number',
      'number.integer': 'Category ID must be a whole number'
    }),

  description: Joi.string().trim().max(1000).optional().allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  unit: Joi.string().trim().max(20).optional().default('Unit')
    .messages({
      'string.max': 'Unit cannot exceed 20 characters'
    }),

  salePrice: Joi.number().precision(2).min(0).optional()
    .messages({
      'number.min': 'Sale price cannot be negative'
    }),

  costPrice: Joi.number().precision(2).min(0).optional()
    .messages({
      'number.min': 'Cost price cannot be negative'
    }),

  minimumStock: Joi.number().precision(2).min(0).optional().default(0)
    .messages({
      'number.min': 'Minimum stock cannot be negative'
    }),

  currentStock: Joi.number().precision(2).min(0).optional().default(0)
    .messages({
      'number.min': 'Current stock cannot be negative'
    }),

  hsnCode: Joi.string().trim().max(20).optional().allow('')
    .messages({
      'string.max': 'HSN code cannot exceed 20 characters'
    }),

  taxRate: Joi.number().precision(2).min(0).max(100).optional()
    .messages({
      'number.min': 'Tax rate cannot be negative',
      'number.max': 'Tax rate cannot exceed 100%'
    }),

  barcode: Joi.string().trim().max(100).optional().allow('')
    .messages({
      'string.max': 'Barcode cannot exceed 100 characters'
    }),

  brand: Joi.string().trim().max(100).optional().allow('')
    .messages({
      'string.max': 'Brand cannot exceed 100 characters'
    }),

  model: Joi.string().trim().max(100).optional().allow('')
    .messages({
      'string.max': 'Model cannot exceed 100 characters'
    }),

  weight: Joi.number().precision(3).min(0).optional()
    .messages({
      'number.min': 'Weight cannot be negative'
    }),

  dimensions: Joi.string().trim().max(100).optional().allow('')
    .messages({
      'string.max': 'Dimensions cannot exceed 100 characters'
    }),

  notes: Joi.string().max(1000).optional().allow('')
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),

  isActive: Joi.boolean().optional().default(true),

  trackInventory: Joi.boolean().optional().default(true)
};

// Create product validation schema
const createProductSchema = Joi.object({
  ...productBaseSchema
});

// Update product validation schema
const updateProductSchema = Joi.object({
  ...Object.keys(productBaseSchema).reduce((acc, key) => {
    if (key === 'productType') {
      acc[key] = productBaseSchema[key].optional();
    } else {
      acc[key] = productBaseSchema[key];
    }
    return acc;
  }, {})
});

// Query validation schema for filtering products
const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1)
    .messages({
      'number.min': 'Page must be at least 1',
      'number.integer': 'Page must be a whole number'
    }),

  limit: Joi.number().integer().min(1).max(100).optional().default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
      'number.integer': 'Limit must be a whole number'
    }),

  search: Joi.string().trim().max(255).optional()
    .messages({
      'string.max': 'Search term cannot exceed 255 characters'
    }),

  categoryId: Joi.number().integer().positive().optional()
    .messages({
      'number.positive': 'Category ID must be a positive number',
      'number.integer': 'Category ID must be a whole number'
    }),

  productType: Joi.string().valid('goods', 'service').optional()
    .messages({
      'any.only': 'Product type must be goods or service'
    }),

  isActive: Joi.boolean().optional(),

  lowStock: Joi.boolean().optional(),

  sortBy: Joi.string().valid(
    'productName', 'productCode', 'productType', 'salePrice', 'costPrice',
    'currentStock', 'minimumStock', 'createdAt', 'updatedAt'
  ).optional().default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: productName, productCode, productType, salePrice, costPrice, currentStock, minimumStock, createdAt, updatedAt'
    }),

  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional().default('DESC')
    .messages({
      'any.only': 'Sort order must be ASC or DESC'
    })
});

// Stock update validation schema
const stockUpdateSchema = Joi.object({
  quantity: Joi.number().precision(2).positive().required()
    .messages({
      'number.positive': 'Quantity must be positive',
      'any.required': 'Quantity is required'
    }),

  type: Joi.string().valid('in', 'out').required()
    .messages({
      'any.only': 'Type must be in or out',
      'any.required': 'Type is required'
    }),

  notes: Joi.string().trim().max(500).optional().allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  stockUpdateSchema
};