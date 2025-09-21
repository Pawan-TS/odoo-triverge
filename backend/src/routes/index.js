const express = require('express');
const authRoutes = require('./auth.routes');
const contactsRoutes = require('./contacts.routes');
const productsRoutes = require('./products.routes');
const productCategoriesRoutes = require('./productCategories.routes');
const salesOrdersRoutes = require('./salesOrders.routes');
const invoicesRoutes = require('./invoices.routes');
const paymentsRoutes = require('./payments.routes');
// Import other route modules as they are created
// const usersRoutes = require('./users.routes');
// const taxesRoutes = require('./taxes.routes');
// const coaRoutes = require('./coa.routes');
// const purchaseRoutes = require('./purchase.routes');
// const journalRoutes = require('./journal.routes');
// const stockRoutes = require('./stock.routes');
// const reportsRoutes = require('./reports.routes');
// const hsnRoutes = require('./hsn.routes');

const router = express.Router();

// API version 1 routes
router.use('/auth', authRoutes);
router.use('/contacts', contactsRoutes);
router.use('/products', productsRoutes);
router.use('/product-categories', productCategoriesRoutes);
router.use('/sales-orders', salesOrdersRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/payments', paymentsRoutes);

// Additional routes will be added here as they are implemented
// router.use('/users', usersRoutes);
// router.use('/taxes', taxesRoutes);
// router.use('/chart-of-accounts', coaRoutes);
// router.use('/purchase-orders', purchaseRoutes);
// router.use('/vendor-bills', vendorBillsRoutes);
// router.use('/journal-entries', journalRoutes);
// router.use('/stock', stockRoutes);
// router.use('/reports', reportsRoutes);
// router.use('/hsn', hsnRoutes);

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple test endpoint to verify backend connectivity
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is accessible and working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      auth: {
        'POST /auth/register': 'Register new organization and admin user',
        'POST /auth/login': 'Login user',
        'POST /auth/refresh': 'Refresh access token',
        'GET /auth/profile': 'Get current user profile',
        'PUT /auth/profile': 'Update current user profile',
        'POST /auth/change-password': 'Change password',
        'POST /auth/logout': 'Logout user',
        'GET /auth/validate': 'Validate token'
      },
      contacts: {
        'POST /contacts': 'Create new contact',
        'GET /contacts': 'Get all contacts with pagination',
        'GET /contacts/stats': 'Get contact statistics',
        'GET /contacts/customers': 'Get customers only',
        'GET /contacts/vendors': 'Get vendors only',
        'GET /contacts/code/:code': 'Get contact by code',
        'GET /contacts/:id': 'Get contact by ID',
        'PUT /contacts/:id': 'Update contact',
        'DELETE /contacts/:id': 'Delete contact'
      },
      products: {
        'POST /products': 'Create new product',
        'GET /products': 'Get all products with pagination',
        'GET /products/stats': 'Get product statistics',
        'GET /products/low-stock': 'Get low stock products',
        'GET /products/code/:code': 'Get product by code',
        'GET /products/:id': 'Get product by ID',
        'PUT /products/:id': 'Update product',
        'PUT /products/:id/stock': 'Update product stock',
        'DELETE /products/:id': 'Delete product'
      },
      productCategories: {
        'POST /product-categories': 'Create new product category',
        'GET /product-categories': 'Get all categories with pagination',
        'GET /product-categories/tree': 'Get category tree structure',
        'GET /product-categories/stats': 'Get category statistics',
        'GET /product-categories/:id': 'Get category by ID',
        'PUT /product-categories/:id': 'Update category',
        'DELETE /product-categories/:id': 'Delete category'
      }
      // Additional endpoint documentation will be added here
    }
  });
});

module.exports = router;