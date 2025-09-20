const { User, Role, UserRole } = require('../models');
const { sendErrorResponse } = require('../utils/response');

/**
 * Role-based access control middleware
 * @param {string|Array} allowedRoles - Single role or array of roles allowed
 */
const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendErrorResponse(res, 401, 'Authentication required');
      }

      // Convert single role to array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Get user roles
      const userRoles = await UserRole.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['name']
          }
        ]
      });

      const userRoleNames = userRoles.map(ur => ur.role.name);

      // Check if user has any of the required roles
      const hasPermission = roles.some(role => userRoleNames.includes(role));

      if (!hasPermission) {
        return sendErrorResponse(res, 403, 'Insufficient permissions');
      }

      // Attach user roles to request for further use
      req.user.roles = userRoleNames;
      
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return sendErrorResponse(res, 500, 'Authorization error');
    }
  };
};

/**
 * Admin only access
 */
const adminOnly = roleMiddleware('Admin');

/**
 * Admin or Manager access
 */
const adminOrManager = roleMiddleware(['Admin', 'Manager']);

/**
 * Admin, Manager, or Accountant access
 */
const adminOrAccountant = roleMiddleware(['Admin', 'Manager', 'Accountant']);

/**
 * All roles except Customer
 */
const internalUsers = roleMiddleware(['Admin', 'Manager', 'Accountant', 'Invoicing']);

/**
 * Check if user has specific permission within their role context
 */
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return sendErrorResponse(res, 401, 'Authentication required');
      }

      const { roles } = req.user;

      // Define role permissions
      const permissions = {
        'create_master_data': ['Admin', 'Manager'],
        'edit_master_data': ['Admin', 'Manager'],
        'delete_master_data': ['Admin'],
        'create_transactions': ['Admin', 'Manager', 'Accountant', 'Invoicing'],
        'edit_transactions': ['Admin', 'Manager', 'Accountant'],
        'delete_transactions': ['Admin', 'Manager'],
        'view_financial_reports': ['Admin', 'Manager', 'Accountant'],
        'manage_users': ['Admin'],
        'manage_organization': ['Admin'],
        'create_journal_entries': ['Admin', 'Manager', 'Accountant'],
        'view_audit_logs': ['Admin', 'Manager']
      };

      const allowedRoles = permissions[permission];
      if (!allowedRoles) {
        return sendErrorResponse(res, 500, 'Invalid permission');
      }

      const hasAccess = allowedRoles.some(role => roles.includes(role));
      if (!hasAccess) {
        return sendErrorResponse(res, 403, `Permission denied: ${permission}`);
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return sendErrorResponse(res, 500, 'Authorization error');
    }
  };
};

module.exports = {
  roleMiddleware,
  adminOnly,
  adminOrManager,
  adminOrAccountant,
  internalUsers,
  hasPermission
};