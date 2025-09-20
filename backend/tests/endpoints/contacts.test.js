const testHelper = require('../helpers/testHelper');

describe('Contacts Endpoints', () => {
  let authData;

  beforeAll(async () => {
    // Create seed data for this test suite
    await testHelper.createSeedData();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
    authData = await testHelper.loginTestUser();
  });

  describe('POST /api/v1/contacts', () => {
    const validContactData = {
      contactName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      contactType: 'Customer',
      isCompany: false
    };

    it('should create a new contact successfully', async () => {
      const response = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(validContactData);

      if (response.status !== 201) {
        console.log('Validation Error Response:', JSON.stringify(response.body, null, 2));
      }

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.contactName).toBe(validContactData.contactName);
      expect(response.body.data.email).toBe(validContactData.email);
      expect(response.body.data.organizationId).toBe(authData.organization.id);
    });

    it('should create a company contact', async () => {
      const companyData = {
        ...validContactData,
        contactName: 'ABC Company',
        isCompany: true,
        vatNumber: 'VAT123456'
      };

      const response = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(companyData);

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.isCompany).toBe(true);
      expect(response.body.data.vatNumber).toBe(companyData.vatNumber);
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.request
        .post('/api/v1/contacts')
        .send(validContactData);

      testHelper.expectUnauthorized(response);
    });

    it('should fail with invalid contact type', async () => {
      const response = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send({ ...validContactData, contactType: 'invalid' });

      testHelper.expectValidationError(response, 'contactType');
    });

    it('should fail with invalid email format', async () => {
      const response = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send({ ...validContactData, email: 'invalid-email' });

      testHelper.expectValidationError(response, 'email');
    });

    it('should fail with missing required fields', async () => {
      const response = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send({ email: 'test@example.com' });

      testHelper.expectValidationError(response);
    });
  });

  describe('GET /api/v1/contacts', () => {
    beforeEach(async () => {
      // Create test contacts
      await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestContactData({ contactName: 'Contact 1', contactType: 'Customer' }));

      await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestContactData({ contactName: 'Contact 2', contactType: 'Vendor' }));

      await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestContactData({ contactName: 'Contact 3', contactType: 'Customer' }));
    });

    it('should get all contacts', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.contacts).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter contacts by type', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts?contactType=Customer')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.contacts).toHaveLength(2);
      expect(response.body.data.contacts.every(c => c.contactType === 'Customer')).toBe(true);
    });

    it('should search contacts by name', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts?search=Contact 1')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.contacts).toHaveLength(1);
      expect(response.body.data.contacts[0].contactName).toContain('Contact 1');
    });

    it('should paginate contacts', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts?page=1&limit=2')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.contacts).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts');

      testHelper.expectUnauthorized(response);
    });
  });

  describe('GET /api/v1/contacts/:id', () => {
    let contactId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestContactData());

      contactId = createResponse.body.data.id;
    });

    it('should get contact by id', async () => {
      const response = await testHelper.request
        .get(`/api/v1/contacts/${contactId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.id).toBe(contactId);
    });

    it('should fail with non-existent contact id', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts/99999')
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(response);
    });

    it('should fail with invalid contact id format', async () => {
      const response = await testHelper.request
        .get('/api/v1/contacts/invalid-id')
        .set('Authorization', authData.authHeader);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/contacts/:id', () => {
    let contactId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestContactData());

      contactId = createResponse.body.data.id;
    });

    it('should update contact successfully', async () => {
      const updateData = {
        name: 'Updated Contact Name',
        email: 'updated@example.com'
      };

      const response = await testHelper.request
        .put(`/api/v1/contacts/${contactId}`)
        .set('Authorization', authData.authHeader)
        .send(updateData);

      testHelper.expectSuccess(response);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
    });

    it('should fail with non-existent contact id', async () => {
      const response = await testHelper.request
        .put('/api/v1/contacts/99999')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Updated Name' });

      testHelper.expectNotFound(response);
    });

    it('should fail with invalid data', async () => {
      const response = await testHelper.request
        .put(`/api/v1/contacts/${contactId}`)
        .set('Authorization', authData.authHeader)
        .send({ email: 'invalid-email' });

      testHelper.expectValidationError(response, 'email');
    });
  });

  describe('DELETE /api/v1/contacts/:id', () => {
    let contactId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/contacts')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestContactData());

      contactId = createResponse.body.data.id;
    });

    it('should delete contact successfully', async () => {
      const response = await testHelper.request
        .delete(`/api/v1/contacts/${contactId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);

      // Verify contact is deleted
      const getResponse = await testHelper.request
        .get(`/api/v1/contacts/${contactId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(getResponse);
    });

    it('should fail with non-existent contact id', async () => {
      const response = await testHelper.request
        .delete('/api/v1/contacts/99999')
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(response);
    });
  });
});