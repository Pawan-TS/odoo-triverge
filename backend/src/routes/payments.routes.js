const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authenticate } = require('../middleware/auth');
const { validatePayment, validatePaymentUpdate, validatePaymentAllocation } = require('../validations/payment.validation');

// Apply authentication middleware to all routes
router.use(authenticate);

// Payment routes
router.get('/', paymentsController.getPayments);
router.get('/statistics', paymentsController.getPaymentStatistics);
router.post('/', validatePayment, paymentsController.createPayment);
router.get('/:id', paymentsController.getPaymentById);
router.put('/:id', validatePaymentUpdate, paymentsController.updatePayment);
router.post('/:id/allocate', validatePaymentAllocation, paymentsController.allocatePayment);
router.delete('/:id', paymentsController.deletePayment);

// Contact-specific routes
router.get('/contacts/:contactId/unallocated', paymentsController.getUnallocatedPayments);
router.get('/contacts/:contactId/outstanding-invoices', paymentsController.getOutstandingInvoices);

module.exports = router;