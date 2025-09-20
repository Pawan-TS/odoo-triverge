const testHelper = require('../helpers/testHelper');

describe('API Basic Functionality', () => {
  describe('Health Check Endpoint', () => {
    it('should return health status without authentication', async () => {
      const response = await testHelper.request
        .get('/api/v1/health');

      testHelper.expectSuccess(response);
      expect(response.body.message).toBe('API is healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('should return proper health check format', async () => {
      const response = await testHelper.request
        .get('/api/v1/health');

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('API Base Routes', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await testHelper.request
        .get('/api/v1/non-existent');

      expect(response.status).toBe(404);
    });

    it('should have proper CORS headers', async () => {
      const response = await testHelper.request
        .get('/api/v1/health');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});