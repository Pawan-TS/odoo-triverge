const contactsService = require('../services/contacts.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class ContactsController {
  /**
   * Create a new contact
   */
  async createContact(req, res, next) {
    try {
      const { organizationId } = req.user;
      const contact = await contactsService.createContact(req.body, organizationId);
      
      return sendSuccessResponse(res, 201, 'Contact created successfully', contact);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all contacts with pagination and filtering
   */
  async getContacts(req, res, next) {
    try {
      const { organizationId } = req.user;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        contactType: req.query.contactType,
        isActive: req.query.isActive,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await contactsService.getContacts(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Contacts retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get contact by ID
   */
  async getContactById(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const contact = await contactsService.getContactById(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Contact retrieved successfully', contact);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get contact by code
   */
  async getContactByCode(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { code } = req.params;
      
      const contact = await contactsService.getContactByCode(code, organizationId);
      
      return sendSuccessResponse(res, 200, 'Contact retrieved successfully', contact);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update contact
   */
  async updateContact(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const contact = await contactsService.updateContact(id, req.body, organizationId);
      
      return sendSuccessResponse(res, 200, 'Contact updated successfully', contact);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(req, res, next) {
    try {
      const { organizationId } = req.user;
      const { id } = req.params;
      
      const result = await contactsService.deleteContact(id, organizationId);
      
      return sendSuccessResponse(res, 200, 'Contact deleted successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get contact statistics
   */
  async getContactStats(req, res, next) {
    try {
      const { organizationId } = req.user;
      
      const stats = await contactsService.getContactStats(organizationId);
      
      return sendSuccessResponse(res, 200, 'Contact statistics retrieved successfully', stats);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get customers only
   */
  async getCustomers(req, res, next) {
    try {
      const { organizationId } = req.user;
      const options = {
        ...req.query,
        contactType: 'customer'
      };

      const result = await contactsService.getContacts(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Customers retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get vendors only
   */
  async getVendors(req, res, next) {
    try {
      const { organizationId } = req.user;
      const options = {
        ...req.query,
        contactType: 'vendor'
      };

      const result = await contactsService.getContacts(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Vendors retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ContactsController();
