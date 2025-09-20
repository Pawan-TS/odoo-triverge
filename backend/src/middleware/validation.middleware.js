const Joi = require('joi');
const { ValidationError } = require('../utils/appError');

/**
 * Middleware to validate request data using Joi schemas
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        message: detail.message,
        field: detail.path.join('.'),
        path: detail.path.join('.'),
        type: detail.type
      }));

      const validationError = new ValidationError('Validation failed', details);
      // Mark parameter validation errors for different status code
      if (property === 'params') {
        validationError.isParamValidation = true;
      }
      return next(validationError);
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return validateRequest(schema, 'query');
};

/**
 * Validate request body
 */
const validateBody = (schema) => {
  return validateRequest(schema, 'body');
};

/**
 * Validate request parameters
 */
const validateParams = (schema) => {
  return validateRequest(schema, 'params');
};

/**
 * Middleware to validate file uploads
 */
const validateFileUpload = (options = {}) => {
  return (req, res, next) => {
    const {
      required = false,
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = [],
      maxFiles = 1
    } = options;

    // Check if file is required
    if (required && (!req.files || Object.keys(req.files).length === 0)) {
      return next(new ValidationError('File upload is required'));
    }

    // If no files uploaded and not required, continue
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files);

    // Check number of files
    if (files.length > maxFiles) {
      return next(new ValidationError(`Maximum ${maxFiles} files allowed`));
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return next(new ValidationError(
          `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`
        ));
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return next(new ValidationError(
          `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        ));
      }
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  });

  const { error, value } = schema.validate({
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder
  });

  if (error) {
    return next(new ValidationError(error.details[0].message));
  }

  // Add pagination to request
  req.pagination = {
    page: value.page,
    limit: value.limit,
    offset: (value.page - 1) * value.limit,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder
  };

  next();
};

/**
 * Validate search parameters
 */
const validateSearch = (req, res, next) => {
  const schema = Joi.object({
    search: Joi.string().min(1).max(100).optional(),
    searchFields: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional()
  });

  const { error, value } = schema.validate({
    search: req.query.search,
    searchFields: req.query.searchFields
  });

  if (error) {
    return next(new ValidationError(error.details[0].message));
  }

  if (value.search) {
    req.search = {
      term: value.search,
      fields: Array.isArray(value.searchFields) 
        ? value.searchFields 
        : value.searchFields 
          ? [value.searchFields] 
          : ['name']
    };
  }

  next();
};

module.exports = {
  validateRequest,
  validateQuery,
  validateBody,
  validateParams,
  validateFileUpload,
  validatePagination,
  validateSearch
};