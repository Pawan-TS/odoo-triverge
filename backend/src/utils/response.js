/**
 * Standard API response formatter
 */

/**
 * Send success response
 */
const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
const sendErrorResponse = (res, statusCode = 500, message = 'Error', data = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
const sendPaginatedResponse = (res, data, pagination, message = 'Success') => {
  const meta = {
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    }
  };

  return sendSuccessResponse(res, 200, message, data, meta);
};

/**
 * Extract pagination parameters from query
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Create Sequelize pagination options
 */
const createPaginationOptions = (query) => {
  const { page, limit, offset } = getPaginationParams(query);
  
  return {
    limit,
    offset,
    pagination: { page, limit }
  };
};

/**
 * Format validation errors
 */
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message,
    value: error.value
  }));
};

/**
 * Success response shortcuts
 */
const success = (res, data = null, message = 'Success') => {
  return sendSuccessResponse(res, 200, message, data);
};

const created = (res, data = null, message = 'Created successfully') => {
  return sendSuccessResponse(res, 201, message, data);
};

const updated = (res, data = null, message = 'Updated successfully') => {
  return sendSuccessResponse(res, 200, message, data);
};

const deleted = (res, message = 'Deleted successfully') => {
  return sendSuccessResponse(res, 200, message);
};

/**
 * Error response shortcuts
 */
const badRequest = (res, message = 'Bad request', data = null) => {
  return sendErrorResponse(res, 400, message, data);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return sendErrorResponse(res, 401, message);
};

const forbidden = (res, message = 'Forbidden') => {
  return sendErrorResponse(res, 403, message);
};

const notFound = (res, message = 'Not found') => {
  return sendErrorResponse(res, 404, message);
};

const conflict = (res, message = 'Conflict') => {
  return sendErrorResponse(res, 409, message);
};

const validationError = (res, errors, message = 'Validation failed') => {
  const formattedErrors = Array.isArray(errors) ? formatValidationErrors(errors) : errors;
  return sendErrorResponse(res, 422, message, { errors: formattedErrors });
};

const serverError = (res, message = 'Internal server error') => {
  return sendErrorResponse(res, 500, message);
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  getPaginationParams,
  createPaginationOptions,
  formatValidationErrors,
  success,
  created,
  updated,
  deleted,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError
};