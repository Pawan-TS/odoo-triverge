const { AuditLog } = require('../models');
const logger = require('../config/logger');

/**
 * Audit logging middleware
 * Captures important data changes for compliance and tracking
 */
const auditMiddleware = (req, res, next) => {
  // Only audit specific routes and methods
  const auditablePaths = [
    '/api/v1/invoices',
    '/api/v1/vendor-bills', 
    '/api/v1/payments',
    '/api/v1/journal-entries',
    '/api/v1/contacts',
    '/api/v1/products',
    '/api/v1/chart-of-accounts',
    '/api/v1/users'
  ];

  const auditableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  // Check if this request should be audited
  const shouldAudit = auditablePaths.some(path => req.path.startsWith(path)) && 
                     auditableMethods.includes(req.method);

  if (!shouldAudit) {
    return next();
  }

  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log the audit entry after successful response
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logAuditEntry(req, data).catch(error => {
        logger.error('Failed to log audit entry:', error);
      });
    }
    
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Log audit entry to database
 */
const logAuditEntry = async (req, responseData) => {
  try {
    const operation = getOperationType(req.method);
    const tableName = getTableName(req.path);
    const recordId = getRecordId(req, responseData);

    const auditData = {
      organizationId: req.user?.organizationId || null,
      tableName,
      recordId,
      operation,
      changedBy: req.user?.id || null,
      changeData: {
        method: req.method,
        path: req.path,
        requestBody: sanitizeData(req.body),
        responseData: sanitizeData(responseData),
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    };

    await AuditLog.create(auditData);
  } catch (error) {
    logger.error('Audit logging error:', error);
  }
};

/**
 * Get operation type from HTTP method
 */
const getOperationType = (method) => {
  switch (method) {
    case 'POST': return 'INSERT';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'UPDATE';
  }
};

/**
 * Extract table name from request path
 */
const getTableName = (path) => {
  const pathMap = {
    '/api/v1/invoices': 'invoices',
    '/api/v1/vendor-bills': 'vendor_bills',
    '/api/v1/payments': 'payments',
    '/api/v1/journal-entries': 'journal_entries',
    '/api/v1/contacts': 'contacts',
    '/api/v1/products': 'products',
    '/api/v1/chart-of-accounts': 'chart_of_accounts',
    '/api/v1/users': 'users',
    '/api/v1/sales-orders': 'sales_orders',
    '/api/v1/purchase-orders': 'purchase_orders'
  };

  for (const [pathPrefix, tableName] of Object.entries(pathMap)) {
    if (path.startsWith(pathPrefix)) {
      return tableName;
    }
  }

  return 'unknown';
};

/**
 * Extract record ID from request or response
 */
const getRecordId = (req, responseData) => {
  // Try to get ID from URL params first
  if (req.params.id) {
    return parseInt(req.params.id);
  }

  // Try to get ID from response data for CREATE operations
  if (responseData && responseData.data && responseData.data.id) {
    return responseData.data.id;
  }

  // For bulk operations or when ID is not available
  return null;
};

/**
 * Sanitize sensitive data before logging
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'passwordHash', 
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'key'
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

/**
 * Manual audit log function for complex operations
 */
const createAuditLog = async (options) => {
  try {
    const {
      organizationId,
      tableName,
      recordId,
      operation,
      changedBy,
      changeData
    } = options;

    await AuditLog.create({
      organizationId,
      tableName,
      recordId,
      operation,
      changedBy,
      changeData: sanitizeData(changeData)
    });
  } catch (error) {
    logger.error('Manual audit logging error:', error);
  }
};

module.exports = {
  auditMiddleware,
  createAuditLog,
  logAuditEntry
};