const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoices.controller');
const { authenticate } = require('../middleware/auth');
const { validateInvoice, validateInvoiceUpdate, validatePayment } = require('../validations/invoice.validation');

// Apply authentication middleware to all routes
router.use(authenticate);

// Invoice routes
router.get('/', invoicesController.getInvoices);
router.get('/statistics', invoicesController.getInvoiceStatistics);
router.post('/', validateInvoice, invoicesController.createInvoice);
router.get('/:id', invoicesController.getInvoiceById);
router.put('/:id', validateInvoiceUpdate, invoicesController.updateInvoice);
router.post('/:id/send', invoicesController.sendInvoice);
router.post('/:id/payments', validatePayment, invoicesController.recordPayment);
router.post('/:id/cancel', invoicesController.cancelInvoice);
router.delete('/:id', invoicesController.deleteInvoice);

module.exports = router;