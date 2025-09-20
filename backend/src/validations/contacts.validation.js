const Joi = require('joi');

// Base contact schema
const contactBaseSchema = {
  contactName: Joi.string().trim().min(2).max(255).required()
    .messages({
      'string.empty': 'Contact name is required',
      'string.min': 'Contact name must be at least 2 characters long',
      'string.max': 'Contact name cannot exceed 255 characters'
    }),
  
  contactCode: Joi.string().trim().max(50).optional()
    .messages({
      'string.max': 'Contact code cannot exceed 50 characters'
    }),

  contactType: Joi.string().valid('customer', 'vendor', 'both').required()
    .messages({
      'any.only': 'Contact type must be customer, vendor, or both',
      'any.required': 'Contact type is required'
    }),

  email: Joi.string().email().max(255).optional().allow('')
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email cannot exceed 255 characters'
    }),

  phone: Joi.string().trim().max(20).optional().allow('')
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters'
    }),

  mobile: Joi.string().trim().max(20).optional().allow('')
    .messages({
      'string.max': 'Mobile number cannot exceed 20 characters'
    }),

  website: Joi.string().uri().max(255).optional().allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL',
      'string.max': 'Website URL cannot exceed 255 characters'
    }),

  taxNumber: Joi.string().trim().max(50).optional().allow('')
    .messages({
      'string.max': 'Tax number cannot exceed 50 characters'
    }),

  gstNumber: Joi.string().trim().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional().allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid GST number format',
      'string.max': 'GST number cannot exceed 15 characters'
    }),

  panNumber: Joi.string().trim().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional().allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid PAN number format'
    }),

  creditLimit: Joi.number().precision(2).min(0).optional()
    .messages({
      'number.min': 'Credit limit cannot be negative'
    }),

  creditDays: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': 'Credit days cannot be negative',
      'number.integer': 'Credit days must be a whole number'
    }),

  openingBalance: Joi.number().precision(2).optional()
    .messages({
      'number.base': 'Opening balance must be a valid number'
    }),

  notes: Joi.string().max(1000).optional().allow('')
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),

  isActive: Joi.boolean().optional().default(true)
};

// Address schema
const addressSchema = Joi.object({
  addressType: Joi.string().valid('billing', 'shipping', 'both').required()
    .messages({
      'any.only': 'Address type must be billing, shipping, or both',
      'any.required': 'Address type is required'
    }),

  addressLine1: Joi.string().trim().max(255).required()
    .messages({
      'string.empty': 'Address line 1 is required',
      'string.max': 'Address line 1 cannot exceed 255 characters'
    }),

  addressLine2: Joi.string().trim().max(255).optional().allow('')
    .messages({
      'string.max': 'Address line 2 cannot exceed 255 characters'
    }),

  city: Joi.string().trim().max(100).required()
    .messages({
      'string.empty': 'City is required',
      'string.max': 'City cannot exceed 100 characters'
    }),

  state: Joi.string().trim().max(100).required()
    .messages({
      'string.empty': 'State is required',
      'string.max': 'State cannot exceed 100 characters'
    }),

  postalCode: Joi.string().trim().max(20).required()
    .messages({
      'string.empty': 'Postal code is required',
      'string.max': 'Postal code cannot exceed 20 characters'
    }),

  country: Joi.string().trim().max(100).optional().default('India')
    .messages({
      'string.max': 'Country cannot exceed 100 characters'
    }),

  isDefault: Joi.boolean().optional().default(false)
});

// Create contact validation schema
const createContactSchema = Joi.object({
  ...contactBaseSchema,
  addresses: Joi.array().items(addressSchema).optional().max(10)
    .messages({
      'array.max': 'Cannot have more than 10 addresses per contact'
    })
});

// Update contact validation schema
const updateContactSchema = Joi.object({
  ...Object.keys(contactBaseSchema).reduce((acc, key) => {
    if (key === 'contactType') {
      acc[key] = contactBaseSchema[key].optional();
    } else {
      acc[key] = contactBaseSchema[key];
    }
    return acc;
  }, {}),
  addresses: Joi.array().items(addressSchema).optional().max(10)
    .messages({
      'array.max': 'Cannot have more than 10 addresses per contact'
    })
});

// Query validation schema for filtering contacts
const contactQuerySchema = Joi.object({
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

  contactType: Joi.string().valid('customer', 'vendor', 'both').optional()
    .messages({
      'any.only': 'Contact type must be customer, vendor, or both'
    }),

  isActive: Joi.boolean().optional(),

  sortBy: Joi.string().valid(
    'contactName', 'contactCode', 'contactType', 'email', 'phone', 
    'createdAt', 'updatedAt'
  ).optional().default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: contactName, contactCode, contactType, email, phone, createdAt, updatedAt'
    }),

  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional().default('DESC')
    .messages({
      'any.only': 'Sort order must be ASC or DESC'
    })
});

module.exports = {
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
  addressSchema
};