const express = require('express');
const router = express.Router();
const salesOrdersController = require('../controllers/salesOrders.controller');
const { authenticate } = require('../middleware/auth');
const { validateSalesOrder, validateSalesOrderUpdate } = require('../validations/salesOrder.validation');

// Apply authentication middleware to all routes
router.use(authenticate);

// Sales order routes
router.get('/', salesOrdersController.getSalesOrders);
router.get('/statistics', salesOrdersController.getSalesOrderStatistics);
router.post('/', validateSalesOrder, salesOrdersController.createSalesOrder);
router.get('/:id', salesOrdersController.getSalesOrderById);
router.put('/:id', validateSalesOrderUpdate, salesOrdersController.updateSalesOrder);
router.post('/:id/confirm', salesOrdersController.confirmSalesOrder);
router.post('/:id/cancel', salesOrdersController.cancelSalesOrder);
router.delete('/:id', salesOrdersController.deleteSalesOrder);

module.exports = router;