const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const App = require('../../src/app');
const { User, Organization, Role, DocumentSequence } = require('../../src/models');
const { ROLES } = require('../../src/utils/constants');

class TestHelper {
  constructor() {
    this.appInstance = new App();
    this.app = this.appInstance.app;
    this.request = request(this.app);
  }

  // Create seed data required for tests
  async createSeedData() {
    // Create roles
    const roles = [
      { id: 1, name: ROLES.ADMIN, description: 'Administrator role' },
      { id: 2, name: ROLES.MANAGER, description: 'Manager role' },
      { id: 3, name: ROLES.ACCOUNTANT, description: 'Accountant role' },
      { id: 4, name: ROLES.INVOICING, description: 'Invoicing role' },
      { id: 5, name: ROLES.CUSTOMER, description: 'Customer role' }
    ];
    
    for (const roleData of roles) {
      await Role.findOrCreate({
        where: { id: roleData.id },
        defaults: roleData
      });
    }
  }

  // Create a test user with organization
  async createTestUser(userData = {}) {
    const defaultUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true
    };

    const finalUserData = { ...defaultUserData, ...userData };
    
    // Create organization first
    const organization = await Organization.create({
      name: 'Test Organization',
      code: 'TEST_ORG',
      settings: {}
    });

    // Create user
    const user = await User.create({
      ...finalUserData,
      organizationId: organization.id
    });

    return { user, organization };
  }

  // Generate JWT token for testing
  generateTestToken(userId, organizationId) {
    return jwt.sign(
      { 
        userId, 
        organizationId,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Login helper that returns token and user
  async loginTestUser(email = 'test@example.com', password = 'password123') {
    const { user, organization } = await this.createTestUser({ email });
    const token = this.generateTestToken(user.id, organization.id);
    
    // Create document sequences for this organization
    const sequences = [
      { organizationId: organization.id, docType: 'CUST', prefix: 'CUST', nextVal: 1, formatMask: '{prefix}-{seq:04d}' },
      { organizationId: organization.id, docType: 'VEND', prefix: 'VEND', nextVal: 1, formatMask: '{prefix}-{seq:04d}' },
      { organizationId: organization.id, docType: 'CONT', prefix: 'CONT', nextVal: 1, formatMask: '{prefix}-{seq:04d}' },
      { organizationId: organization.id, docType: 'PROD', prefix: 'PROD', nextVal: 1, formatMask: '{prefix}-{seq:04d}' },
      { organizationId: organization.id, docType: 'CAT', prefix: 'CAT', nextVal: 1, formatMask: '{prefix}-{seq:04d}' }
    ];

    for (const seqData of sequences) {
      await DocumentSequence.findOrCreate({
        where: { 
          organizationId: seqData.organizationId,
          docType: seqData.docType 
        },
        defaults: seqData
      });
    }
    
    return {
      user,
      organization,
      token,
      authHeader: `Bearer ${token}`
    };
  }

  // Create authenticated request
  async authenticatedRequest(method = 'get', path = '/') {
    const { token } = await this.loginTestUser();
    return this.request[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${token}`);
  }

  // Create test contact data
  createTestContactData(overrides = {}) {
    return {
      contactName: 'Test Contact',
      email: 'contact@test.com',
      phone: '+1234567890',
      contactType: 'Customer',
      isCompany: false,
      ...overrides
    };
  }

  // Create test product data
  createTestProductData(overrides = {}) {
    return {
      name: 'Test Product',
      type: 'consu',
      salePrice: 100.00,
      costPrice: 50.00,
      trackInventory: false,
      isActive: true,
      ...overrides
    };
  }

  // Create test product category data
  createTestCategoryData(overrides = {}) {
    return {
      name: 'Test Category',
      description: 'Test category description',
      isActive: true,
      ...overrides
    };
  }

  // Clean database tables (preserving roles)
  async cleanDatabase() {
    // Define the cleanup order (dependent models first)
    const cleanupOrder = [
      'Product',           // Has foreign key to ProductCategory
      'ProductCategory',   // Has foreign key to Organization
      'DocumentSequence',  // Has foreign key to Organization
      'UserRole',          // Has foreign keys to User and Role
      'User',              // Has foreign key to Organization
      'Organization'       // Independent, can be deleted last
    ];
    
    const models = require('../../src/models');
    
    for (const modelName of cleanupOrder) {
      if (models[modelName] && typeof models[modelName].destroy === 'function') {
        try {
          await models[modelName].destroy({ where: {}, force: true });
        } catch (error) {
          // Ignore errors for non-existent tables during cleanup
          console.warn(`Warning: Could not clean ${modelName}:`, error.message);
        }
      }
    }
  }

  // Assertion helpers
  expectValidationError(response, field) {
    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.data.errors).toBeDefined();
    if (field) {
      expect(response.body.data.errors.some(err => 
        err.field === field || err.path === field
      )).toBe(true);
    }
  }

  expectUnauthorized(response) {
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/unauthorized|token/i);
  }

  expectNotFound(response) {
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/not found/i);
  }

  expectSuccess(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body.success).toBe(true);
  }
}

module.exports = new TestHelper();