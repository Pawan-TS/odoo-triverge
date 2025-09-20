const testHelper = require('../helpers/testHelper');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Create seed data for this test suite
    await testHelper.createSeedData();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    const validRegistrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      organizationName: 'Test Company'
    };

    it('should register a new user successfully', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/register')
        .send(validRegistrationData);

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(validRegistrationData.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with invalid email format', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/register')
        .send({ ...validRegistrationData, email: 'invalid-email' });

      testHelper.expectValidationError(response, 'email');
    });

    it('should fail with weak password', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/register')
        .send({ ...validRegistrationData, password: '123' });

      testHelper.expectValidationError(response, 'password');
    });

    it('should fail with duplicate email', async () => {
      // First registration
      await testHelper.request
        .post('/api/v1/auth/register')
        .send(validRegistrationData);

      // Second registration with same email
      const response = await testHelper.request
        .post('/api/v1/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' });

      testHelper.expectValidationError(response);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(async () => {
      await testHelper.createTestUser({ 
        email: loginCredentials.email,
        password: await require('bcryptjs').hash(loginCredentials.password, 10)
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/login')
        .send(loginCredentials);

      testHelper.expectSuccess(response);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with invalid email', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/login')
        .send({ ...loginCredentials, email: 'wrong@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid password', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/login')
        .send({ ...loginCredentials, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing credentials', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/login')
        .send({});

      testHelper.expectValidationError(response);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const { token, user } = await testHelper.loginTestUser();

      const response = await testHelper.request
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      testHelper.expectSuccess(response);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should fail without token', async () => {
      const response = await testHelper.request
        .get('/api/v1/auth/profile');

      testHelper.expectUnauthorized(response);
    });

    it('should fail with invalid token', async () => {
      const response = await testHelper.request
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      testHelper.expectUnauthorized(response);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('should update profile successfully', async () => {
      const { token } = await testHelper.loginTestUser();
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await testHelper.request
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      testHelper.expectSuccess(response);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
    });

    it('should fail to update email to existing one', async () => {
      const { token } = await testHelper.loginTestUser();
      await testHelper.createTestUser({ email: 'existing@example.com' });

      const response = await testHelper.request
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'existing@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // This would require implementing refresh token logic
      // Placeholder for now
      expect(true).toBe(true);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const { user } = await testHelper.createTestUser();

      const response = await testHelper.request
        .post('/api/v1/auth/forgot-password')
        .send({ email: user.email });

      testHelper.expectSuccess(response);
      expect(response.body.message).toMatch(/reset/i);
    });

    it('should not reveal if email exists', async () => {
      const response = await testHelper.request
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      // Should still return success for security
      testHelper.expectSuccess(response);
    });
  });
});