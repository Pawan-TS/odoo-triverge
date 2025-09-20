const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Organization } = require('../models');
const { sendErrorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendErrorResponse(res, 401, 'Access token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Find user with organization
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Organization,
          as: 'organization',
          where: { isActive: true }
        }
      ],
      where: { isActive: true }
    });

    if (!user) {
      return sendErrorResponse(res, 401, 'Invalid token - user not found');
    }

    // Check if token was issued before last login (simple token invalidation)
    if (decoded.iat < Math.floor(user.lastLogin?.getTime() / 1000)) {
      return sendErrorResponse(res, 401, 'Token expired - please login again');
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      organization: user.organization
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 401, 'Token expired');
    }
    
    console.error('Auth middleware error:', error);
    return sendErrorResponse(res, 500, 'Authentication error');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Organization,
          as: 'organization',
          where: { isActive: true }
        }
      ],
      where: { isActive: true }
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        organization: user.organization
      };
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};