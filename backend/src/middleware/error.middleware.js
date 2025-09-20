const logger = require('../config/logger');
const { sendErrorResponse } = require('../utils/response');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    organizationId: req.user?.organizationId
  });

  // Handle specific error types
  if (error.name === 'SequelizeValidationError') {
    const validationErrors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return sendErrorResponse(res, 400, 'Validation error', { validationErrors });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'field';
    return sendErrorResponse(res, 409, `${field} already exists`);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return sendErrorResponse(res, 400, 'Invalid reference - related record not found');
  }

  if (error.name === 'SequelizeDatabaseError') {
    return sendErrorResponse(res, 500, 'Database error');
  }

  if (error.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 401, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 401, 'Token expired');
  }

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendErrorResponse(res, 400, 'File size too large');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return sendErrorResponse(res, 400, 'Too many files');
    }
    return sendErrorResponse(res, 400, `File upload error: ${error.message}`);
  }

  // Handle custom application errors
  if (error.statusCode) {
    return sendErrorResponse(res, error.statusCode, error.message, error.data);
  }

  // Default server error
  return sendErrorResponse(res, 500, 'Internal server error');
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  return sendErrorResponse(res, 404, 'Route not found');
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error creator
 */
const createValidationError = (message, field = null) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.field = field;
  return error;
};

/**
 * Business logic error creator
 */
const createBusinessError = (message, statusCode = 400, data = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  return error;
};

/**
 * Unauthorized error creator
 */
const createUnauthorizedError = (message = 'Unauthorized') => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

/**
 * Forbidden error creator
 */
const createForbiddenError = (message = 'Forbidden') => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

/**
 * Not found error creator
 */
const createNotFoundError = (message = 'Resource not found') => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createValidationError,
  createBusinessError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError
};