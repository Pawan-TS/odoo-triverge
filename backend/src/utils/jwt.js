const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: config.appName,
    audience: config.appUrl
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.appName,
    audience: config.appUrl
  });
};

/**
 * Verify JWT access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: config.appName,
      audience: config.appUrl
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Verify JWT refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: config.appName,
      audience: config.appUrl
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Decode JWT token without verification (for debugging)
 */
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

/**
 * Get token expiration time
 */
const getTokenExpiration = (token) => {
  const decoded = jwt.decode(token);
  return decoded ? new Date(decoded.exp * 1000) : null;
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration ? expiration < new Date() : true;
};

/**
 * Generate token pair (access + refresh)
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn,
    tokenType: 'Bearer'
  };
};

/**
 * Extract bearer token from authorization header
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

/**
 * Create JWT payload from user data
 */
const createPayload = (user) => {
  return {
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    iat: Math.floor(Date.now() / 1000)
  };
};

/**
 * Validate JWT structure
 */
const validateTokenStructure = (token) => {
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return false;
  }
  
  try {
    // Try to decode each part
    JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get time until token expires (in seconds)
 */
const getTimeToExpiry = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;
  
  const now = new Date();
  return Math.max(0, Math.floor((expiration - now) / 1000));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  generateTokenPair,
  extractBearerToken,
  createPayload,
  validateTokenStructure,
  getTimeToExpiry
};