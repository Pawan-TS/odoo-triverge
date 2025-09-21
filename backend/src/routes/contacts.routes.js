const express = require('express');
const contactsController = require('../controllers/contacts.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { orgMiddleware } = require('../middleware/org.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { 
  createContactSchema, 
  updateContactSchema, 
  contactQuerySchema,
  contactParamsSchema 
} = require('../validations/contacts.validation');

const router = express.Router();

// Apply authentication and organization validation to all routes
router.use(authMiddleware);
router.use(orgMiddleware);

/**
 * @route   GET /api/v1/contacts/statistics
 * @desc    Get contact statistics (total customers, vendors, active contacts)
 * @access  Private
 */
router.get(
  '/statistics',
  contactsController.getContactStatistics
);

/**
 * @route   POST /api/v1/contacts
 * @desc    Create a new contact
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createContactSchema),
  contactsController.createContact
);

/**
 * @route   GET /api/v1/contacts
 * @desc    Get all contacts with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validateRequest(contactQuerySchema, 'query'),
  contactsController.getContacts
);

/**
 * @route   GET /api/v1/contacts/debug
 * @desc    Debug endpoint to check contacts in database
 * @access  Private
 */
router.get('/debug', contactsController.debugContacts);

/**
 * @route   GET /api/v1/contacts/all-debug
 * @desc    Get ALL contacts regardless of organization (for debugging)
 * @access  Private
 */
router.get('/all-debug', contactsController.getAllContactsDebug);

/**
 * @route   GET /api/v1/contacts/stats
 * @desc    Get contact statistics
 * @access  Private
 */
router.get('/stats', contactsController.getContactStats);

/**
 * @route   GET /api/v1/contacts/customers
 * @desc    Get customers only
 * @access  Private
 */
router.get(
  '/customers',
  validateRequest(contactQuerySchema, 'query'),
  contactsController.getCustomers
);

/**
 * @route   GET /api/v1/contacts/vendors
 * @desc    Get vendors only
 * @access  Private
 */
router.get(
  '/vendors',
  validateRequest(contactQuerySchema, 'query'),
  contactsController.getVendors
);

/**
 * @route   GET /api/v1/contacts/code/:code
 * @desc    Get contact by code
 * @access  Private
 */
router.get('/code/:code', contactsController.getContactByCode);

/**
 * @route   GET /api/v1/contacts/:id
 * @desc    Get contact by ID
 * @access  Private
 */
router.get(
  '/:id', 
  validateRequest(contactParamsSchema, 'params'),
  contactsController.getContactById
);

/**
 * @route   PUT /api/v1/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(contactParamsSchema, 'params'),
  validateRequest(updateContactSchema),
  contactsController.updateContact
);

/**
 * @route   DELETE /api/v1/contacts/:id
 * @desc    Delete contact (soft delete)
 * @access  Private
 */
router.delete(
  '/:id', 
  validateRequest(contactParamsSchema, 'params'),
  contactsController.deleteContact
);

module.exports = router;