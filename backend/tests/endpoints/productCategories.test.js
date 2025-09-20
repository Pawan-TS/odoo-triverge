const testHelper = require('../helpers/testHelper');

describe('Product Categories Endpoints', () => {
  let authData;

  beforeEach(async () => {
    await testHelper.cleanDatabase();
    authData = await testHelper.loginTestUser();
  });

  describe('POST /api/v1/product-categories', () => {
    const validCategoryData = {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      isActive: true
    };

    it('should create a new category successfully', async () => {
      const response = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(validCategoryData);

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.name).toBe(validCategoryData.name);
      expect(response.body.data.description).toBe(validCategoryData.description);
      expect(response.body.data.organizationId).toBe(authData.organization.id);
    });

    it('should create a subcategory', async () => {
      // Create parent category first
      const parentResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(validCategoryData);

      const subcategoryData = {
        name: 'Smartphones',
        description: 'Mobile phones and smartphones',
        parentId: parentResponse.body.data.id,
        isActive: true
      };

      const response = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(subcategoryData);

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.parentId).toBe(subcategoryData.parentId);
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.request
        .post('/api/v1/product-categories')
        .send(validCategoryData);

      testHelper.expectUnauthorized(response);
    });

    it('should fail with duplicate category name', async () => {
      // Create first category
      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(validCategoryData);

      // Try to create duplicate
      const response = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(validCategoryData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const response = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ description: 'Missing name' });

      testHelper.expectValidationError(response);
    });

    it('should fail with invalid parent category', async () => {
      const response = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ ...validCategoryData, parentId: 99999 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/product-categories', () => {
    beforeEach(async () => {
      // Create test categories
      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Electronics', isActive: true });

      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Clothing', isActive: true });

      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Furniture', isActive: false });
    });

    it('should get all categories', async () => {
      const response = await testHelper.request
        .get('/api/v1/product-categories')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.categories).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by active status', async () => {
      const response = await testHelper.request
        .get('/api/v1/product-categories?isActive=true')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.categories.every(c => c.isActive === true)).toBe(true);
    });

    it('should search categories by name', async () => {
      const response = await testHelper.request
        .get('/api/v1/product-categories?search=Electronics')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].name).toBe('Electronics');
    });

    it('should get hierarchical structure', async () => {
      // Create parent and child categories
      const parentResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Technology', isActive: true });

      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ 
          name: 'Computers', 
          parentId: parentResponse.body.data.id,
          isActive: true 
        });

      const response = await testHelper.request
        .get('/api/v1/product-categories?includeHierarchy=true')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      // Should include child categories
      const techCategory = response.body.data.categories.find(c => c.name === 'Technology');
      expect(techCategory.children).toBeDefined();
    });

    it('should paginate categories', async () => {
      const response = await testHelper.request
        .get('/api/v1/product-categories?page=1&limit=2')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.request
        .get('/api/v1/product-categories');

      testHelper.expectUnauthorized(response);
    });
  });

  describe('GET /api/v1/product-categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestCategoryData());

      categoryId = createResponse.body.data.id;
    });

    it('should get category by id', async () => {
      const response = await testHelper.request
        .get(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.id).toBe(categoryId);
    });

    it('should include product count', async () => {
      // Create a product in this category
      await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData(), categoryId });

      const response = await testHelper.request
        .get(`/api/v1/product-categories/${categoryId}?includeProductCount=true`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.productCount).toBe(1);
    });

    it('should include subcategories', async () => {
      // Create subcategory
      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ 
          name: 'Subcategory', 
          parentId: categoryId,
          isActive: true 
        });

      const response = await testHelper.request
        .get(`/api/v1/product-categories/${categoryId}?includeChildren=true`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.children).toHaveLength(1);
    });

    it('should fail with non-existent category id', async () => {
      const response = await testHelper.request
        .get('/api/v1/product-categories/99999')
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(response);
    });
  });

  describe('PUT /api/v1/product-categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestCategoryData());

      categoryId = createResponse.body.data.id;
    });

    it('should update category successfully', async () => {
      const updateData = {
        name: 'Updated Category Name',
        description: 'Updated description',
        isActive: false
      };

      const response = await testHelper.request
        .put(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader)
        .send(updateData);

      testHelper.expectSuccess(response);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.isActive).toBe(updateData.isActive);
    });

    it('should update parent category', async () => {
      // Create new parent category
      const parentResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'New Parent', isActive: true });

      const response = await testHelper.request
        .put(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader)
        .send({ parentId: parentResponse.body.data.id });

      testHelper.expectSuccess(response);
      expect(response.body.data.parentId).toBe(parentResponse.body.data.id);
    });

    it('should fail with non-existent category id', async () => {
      const response = await testHelper.request
        .put('/api/v1/product-categories/99999')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Updated Name' });

      testHelper.expectNotFound(response);
    });

    it('should fail with circular hierarchy', async () => {
      // Create child category
      const childResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Child', parentId: categoryId, isActive: true });

      // Try to make parent a child of its own child
      const response = await testHelper.request
        .put(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader)
        .send({ parentId: childResponse.body.data.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/circular/i);
    });
  });

  describe('DELETE /api/v1/product-categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestCategoryData());

      categoryId = createResponse.body.data.id;
    });

    it('should delete empty category successfully', async () => {
      const response = await testHelper.request
        .delete(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);

      // Verify category is deleted
      const getResponse = await testHelper.request
        .get(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(getResponse);
    });

    it('should fail to delete category with products', async () => {
      // Create product in category
      await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData(), categoryId });

      const response = await testHelper.request
        .delete(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/products/i);
    });

    it('should fail to delete category with subcategories', async () => {
      // Create subcategory
      await testHelper.request
        .post('/api/v1/product-categories')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Subcategory', parentId: categoryId, isActive: true });

      const response = await testHelper.request
        .delete(`/api/v1/product-categories/${categoryId}`)
        .set('Authorization', authData.authHeader);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/subcategories/i);
    });

    it('should fail with non-existent category id', async () => {
      const response = await testHelper.request
        .delete('/api/v1/product-categories/99999')
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(response);
    });
  });
});