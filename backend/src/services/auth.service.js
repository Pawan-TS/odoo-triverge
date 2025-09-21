const { User, Organization, Role, UserRole } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hasher');
const { generateTokenPair, createPayload } = require('../utils/jwt');
const { createDefaultSequences } = require('../utils/sequences');
const { createDefaultCOA, createDefaultTaxes } = require('./coa.service');
const { sequelize } = require('../config/db');
const { createBusinessError, createValidationError } = require('../middleware/error.middleware');
const { ROLES } = require('../utils/constants');
const { Op } = require('sequelize');

class AuthService {
  /**
   * Register new organization with admin user
   */
  async register({ email, password, firstName, lastName, organizationName, phone, role }) {
    const transaction = await sequelize.transaction();
    
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw createBusinessError('Email already registered', 409);
      }

      // Create organization
      const organization = await Organization.create({
        name: organizationName,
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      }, { transaction });

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create admin user
      const user = await User.create({
        organizationId: organization.id,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        isActive: true
      }, { transaction });

      // Assign user role
      const userRole = await Role.findOne({ where: { name: role || ROLES.ADMIN } });
      if (!userRole) {
        throw createBusinessError(`Role '${role || ROLES.ADMIN}' not found in system`);
      }

      await UserRole.create({
        userId: user.id,
        roleId: userRole.id
      }, { transaction });

      // Create default sequences
      await createDefaultSequences(organization.id, transaction);

      // Create default chart of accounts
      await createDefaultCOA(organization.id, transaction);

      // Create default taxes
      await createDefaultTaxes(organization.id, transaction);

      await transaction.commit();

      // Generate tokens
      const payload = createPayload(user);
      const tokens = generateTokenPair(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
          organization: {
            id: organization.id,
            name: organization.name,
            currency: organization.currency,
            timezone: organization.timezone
          }
        },
        tokens
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user with organization
    const user = await User.findOne({
      where: { email, isActive: true },
      include: [
        {
          model: Organization,
          as: 'organization',
          where: { isActive: true }
        }
      ]
    });

    if (!user) {
      throw createBusinessError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw createBusinessError('Invalid email or password', 401);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Get user roles
    const userRoles = await UserRole.findAll({
      where: { userId: user.id },
      include: [{ model: Role, as: 'role' }]
    });

    const roles = userRoles.map(ur => ur.role.name);

    // Generate tokens
    const payload = createPayload(user);
    const tokens = generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        organization: user.organization,
        roles
      },
      tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const { verifyRefreshToken } = require('../utils/jwt');
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findByPk(decoded.userId, {
        where: { isActive: true },
        include: [
          {
            model: Organization,
            as: 'organization',
            where: { isActive: true }
          }
        ]
      });

      if (!user) {
        throw createValidationError('Invalid refresh token');
      }

      // Generate new tokens
      const payload = createPayload(user);
      const tokens = generateTokenPair(payload);

      return { tokens };
    } catch (error) {
      throw createValidationError('Invalid refresh token');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Organization,
          as: 'organization'
        }
      ]
    });

    if (!user) {
      throw createBusinessError('User not found', 404);
    }

    // Get user roles
    const userRoles = await UserRole.findAll({
      where: { userId: user.id },
      include: [{ model: Role, as: 'role' }]
    });

    const roles = userRoles.map(ur => ur.role.name);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      organizationId: user.organizationId,
      organization: user.organization,
      roles,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw createBusinessError('User not found', 404);
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'email'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    // Check for email uniqueness if email is being updated
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: updates.email,
          id: { [Op.ne]: userId }
        } 
      });
      if (existingUser) {
        throw createBusinessError('Email already in use', 409);
      }
    }

    await user.update(updates);
    return this.getProfile(userId);
  }

  /**
   * Change password
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw createBusinessError('User not found', 404);
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw createValidationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await user.update({ passwordHash: newPasswordHash });

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();