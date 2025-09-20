const express = require('express');
const contactsController = require('../controllers/contacts.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateOrganization } = require('../middleware/organization.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { 
  createContactSchema, 
  updateContactSchema, 
  contactQuerySchema 
} = require('../validations/contacts.validation');

const router = express.Router();

// Apply authentication and organization validation to all routes
router.use(authenticate);
router.use(validateOrganization);

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
router.get('/:id', contactsController.getContactById);

/**
 * @route   PUT /api/v1/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(updateContactSchema),
  contactsController.updateContact
);

/**
 * @route   DELETE /api/v1/contacts/:id
 * @desc    Delete contact (soft delete)
 * @access  Private
 */
router.delete('/:id', contactsController.deleteContact);

module.exports = router;