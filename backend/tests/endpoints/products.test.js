const testHelper = require('../helpers/testHelper');

describe('Products Endpoints', () => {
  let authData;
  let categoryId;

  beforeEach(async () => {
    await testHelper.cleanDatabase();
    authData = await testHelper.loginTestUser();
    
    // Create a test category for products
    const categoryResponse = await testHelper.request
      .post('/api/v1/product-categories')
      .set('Authorization', authData.authHeader)
      .send(testHelper.createTestCategoryData());
    
    categoryId = categoryResponse.body.data.id;
  });

  describe('POST /api/v1/products', () => {
    const validProductData = {
      name: 'Test Product',
      type: 'consu',
      salePrice: 100.00,
      costPrice: 50.00,
      trackInventory: false,
      isActive: true
    };

    it('should create a new product successfully', async () => {
      const productData = { ...validProductData, categoryId };

      const response = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send(productData);

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.salePrice).toBe(productData.salePrice);
      expect(response.body.data.organizationId).toBe(authData.organization.id);
    });

    it('should create product with inventory tracking', async () => {
      const productData = {
        ...validProductData,
        type: 'product',
        trackInventory: true,
        currentStock: 100,
        reorderLevel: 10
      };

      const response = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send(productData);

      testHelper.expectSuccess(response, 201);
      expect(response.body.data.trackInventory).toBe(true);
      expect(response.body.data.currentStock).toBe(100);
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.request
        .post('/api/v1/products')
        .send(validProductData);

      testHelper.expectUnauthorized(response);
    });

    it('should fail with invalid product type', async () => {
      const response = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...validProductData, type: 'invalid' });

      testHelper.expectValidationError(response, 'type');
    });

    it('should fail with negative price', async () => {
      const response = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...validProductData, salePrice: -10 });

      testHelper.expectValidationError(response, 'salePrice');
    });

    it('should fail with missing required fields', async () => {
      const response = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ salePrice: 100 });

      testHelper.expectValidationError(response);
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      // Create test products
      await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData({ name: 'Product 1', type: 'consu' }) });

      await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData({ name: 'Product 2', type: 'product' }) });

      await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData({ name: 'Service 1', type: 'service' }) });
    });

    it('should get all products', async () => {
      const response = await testHelper.request
        .get('/api/v1/products')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.products).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter products by type', async () => {
      const response = await testHelper.request
        .get('/api/v1/products?type=consu')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].type).toBe('consu');
    });

    it('should search products by name', async () => {
      const response = await testHelper.request
        .get('/api/v1/products?search=Product 1')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toContain('Product 1');
    });

    it('should filter by price range', async () => {
      const response = await testHelper.request
        .get('/api/v1/products?minPrice=50&maxPrice=150')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      // First create a product with category
      await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData(), categoryId });

      const response = await testHelper.request
        .get(`/api/v1/products?categoryId=${categoryId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('should paginate products', async () => {
      const response = await testHelper.request
        .get('/api/v1/products?page=1&limit=2')
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.request
        .get('/api/v1/products');

      testHelper.expectUnauthorized(response);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestProductData());

      productId = createResponse.body.data.id;
    });

    it('should get product by id', async () => {
      const response = await testHelper.request
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.id).toBe(productId);
    });

    it('should include category information', async () => {
      // Create product with category
      const productWithCategory = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData(), categoryId });

      const response = await testHelper.request
        .get(`/api/v1/products/${productWithCategory.body.data.id}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);
      expect(response.body.data.category).toBeDefined();
    });

    it('should fail with non-existent product id', async () => {
      const response = await testHelper.request
        .get('/api/v1/products/99999')
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(response);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestProductData());

      productId = createResponse.body.data.id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product Name',
        salePrice: 150.00,
        description: 'Updated description'
      };

      const response = await testHelper.request
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', authData.authHeader)
        .send(updateData);

      testHelper.expectSuccess(response);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.salePrice).toBe(updateData.salePrice);
    });

    it('should update inventory settings', async () => {
      const updateData = {
        trackInventory: true,
        currentStock: 50,
        minimumStock: 5
      };

      const response = await testHelper.request
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', authData.authHeader)
        .send(updateData);

      testHelper.expectSuccess(response);
      expect(response.body.data.trackInventory).toBe(true);
      expect(response.body.data.currentStock).toBe(50);
    });

    it('should fail with non-existent product id', async () => {
      const response = await testHelper.request
        .put('/api/v1/products/99999')
        .set('Authorization', authData.authHeader)
        .send({ name: 'Updated Name' });

      testHelper.expectNotFound(response);
    });

    it('should fail with invalid data', async () => {
      const response = await testHelper.request
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', authData.authHeader)
        .send({ salePrice: -10 });

      testHelper.expectValidationError(response, 'salePrice');
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send(testHelper.createTestProductData());

      productId = createResponse.body.data.id;
    });

    it('should delete product successfully', async () => {
      const response = await testHelper.request
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectSuccess(response);

      // Verify product is deleted
      const getResponse = await testHelper.request
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(getResponse);
    });

    it('should fail with non-existent product id', async () => {
      const response = await testHelper.request
        .delete('/api/v1/products/99999')
        .set('Authorization', authData.authHeader);

      testHelper.expectNotFound(response);
    });
  });

  describe('POST /api/v1/products/:id/stock-adjustment', () => {
    let productId;

    beforeEach(async () => {
      const createResponse = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ 
          ...testHelper.createTestProductData(), 
          trackInventory: true,
          currentStock: 100 
        });

      productId = createResponse.body.data.id;
    });

    it('should adjust stock successfully', async () => {
      const adjustmentData = {
        quantity: 50,
        type: 'add',
        reason: 'Stock replenishment'
      };

      const response = await testHelper.request
        .post(`/api/v1/products/${productId}/stock-adjustment`)
        .set('Authorization', authData.authHeader)
        .send(adjustmentData);

      testHelper.expectSuccess(response);
      expect(response.body.data.currentStock).toBe(150);
    });

    it('should fail for non-inventory products', async () => {
      // Create non-inventory product
      const nonInventoryProduct = await testHelper.request
        .post('/api/v1/products')
        .set('Authorization', authData.authHeader)
        .send({ ...testHelper.createTestProductData(), trackInventory: false });

      const response = await testHelper.request
        .post(`/api/v1/products/${nonInventoryProduct.body.data.id}/stock-adjustment`)
        .set('Authorization', authData.authHeader)
        .send({ quantity: 10, type: 'add' });

      expect(response.status).toBe(400);
    });
  });
});