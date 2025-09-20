const Joi = require('joi');

// Base category schema
const categoryBaseSchema = {
  categoryName: Joi.string().trim().min(2).max(255).required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 255 characters'
    }),
  
  categoryCode: Joi.string().trim().max(50).optional()
    .messages({
      'string.max': 'Category code cannot exceed 50 characters'
    }),

  description: Joi.string().trim().max(1000).optional().allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  parentId: Joi.number().integer().positive().optional().allow(null)
    .messages({
      'number.positive': 'Parent ID must be a positive number',
      'number.integer': 'Parent ID must be a whole number'
    }),

  isActive: Joi.boolean().optional().default(true)
};

// Create category validation schema
const createCategorySchema = Joi.object({
  ...categoryBaseSchema
});

// Update category validation schema
const updateCategorySchema = Joi.object({
  ...Object.keys(categoryBaseSchema).reduce((acc, key) => {
    acc[key] = categoryBaseSchema[key];
    return acc;
  }, {})
});

// Query validation schema for filtering categories
const categoryQuerySchema = Joi.object({
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

  parentId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().valid('null', '')
  ).optional()
    .messages({
      'number.positive': 'Parent ID must be a positive number',
      'number.integer': 'Parent ID must be a whole number'
    }),

  isActive: Joi.boolean().optional(),

  includeChildren: Joi.boolean().optional().default(false),

  sortBy: Joi.string().valid(
    'categoryName', 'categoryCode', 'createdAt', 'updatedAt'
  ).optional().default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: categoryName, categoryCode, createdAt, updatedAt'
    }),

  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional().default('DESC')
    .messages({
      'any.only': 'Sort order must be ASC or DESC'
    })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema
};