const { sendErrorResponse } = require('../utils/response');

/**
 * Organization context validation middleware
 * Ensures all requests are scoped to the authenticated user's organization
 */
const orgMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    const { organizationId } = req.user;
    const headerOrgId = req.headers['x-org-id'];

    // If X-Org-Id header is provided, validate it matches user's org
    if (headerOrgId && parseInt(headerOrgId) !== organizationId) {
      return sendErrorResponse(res, 403, 'Organization context mismatch');
    }

    // Attach organization context to request
    req.organizationId = organizationId;
    
    next();
  } catch (error) {
    console.error('Organization middleware error:', error);
    return sendErrorResponse(res, 500, 'Organization validation error');
  }
};

/**
 * Add organization filter to query parameters
 * Automatically adds organizationId to where clauses
 */
const addOrgFilter = (req, res, next) => {
  if (!req.organizationId) {
    return sendErrorResponse(res, 400, 'Organization context required');
  }

  // Add to query parameters for controllers to use
  req.query.organizationId = req.organizationId;
  
  // Helper function to add org filter to any where clause
  req.addOrgFilter = (whereClause = {}) => {
    return {
      ...whereClause,
      organizationId: req.organizationId
    };
  };

  next();
};

/**
 * Validate resource belongs to user's organization
 * Use this for routes that access specific resources by ID
 */
const validateOrgResource = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const organizationId = req.organizationId;

      if (!resourceId) {
        return sendErrorResponse(res, 400, `${idParam} parameter required`);
      }

      // Check if resource exists and belongs to organization
      const resource = await model.findOne({
        where: {
          id: resourceId,
          organizationId: organizationId
        }
      });

      if (!resource) {
        return sendErrorResponse(res, 404, 'Resource not found or access denied');
      }

      // Attach resource to request for controller use
      req.resource = resource;
      
      next();
    } catch (error) {
      console.error('Resource validation error:', error);
      return sendErrorResponse(res, 500, 'Resource validation error');
    }
  };
};

/**
 * Customer portal access - only allow access to own data
 */
const customerPortalAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.roles) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    const { roles } = req.user;

    // If user is customer, restrict access to own contact records only
    if (roles.includes('Customer')) {
      // Find user's associated contact
      const { Contact } = require('../models');
      const contact = await Contact.findOne({
        where: {
          email: req.user.email,
          organizationId: req.organizationId
        }
      });

      if (!contact) {
        return sendErrorResponse(res, 403, 'Customer contact not found');
      }

      // Add contact filter to request
      req.customerContactId = contact.id;
      req.isCustomerPortal = true;
    }

    next();
  } catch (error) {
    console.error('Customer portal middleware error:', error);
    return sendErrorResponse(res, 500, 'Customer portal validation error');
  }
};

module.exports = {
  orgMiddleware,
  addOrgFilter,
  validateOrgResource,
  customerPortalAccess
};