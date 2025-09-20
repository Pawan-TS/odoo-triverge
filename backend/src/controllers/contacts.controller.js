const contactsService = require('../services/contacts.service');
const { successResponse, errorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');

class ContactsController {
  /**
   * Create a new contact
   */
  async createContact(req, res, next) {
    try {
      const { organizationId } = req.user;
      const contact = await contactsService.createContact(req.body, organizationId);
      
      return successResponse(res, contact, 'Contact created successfully', 201);
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
      
      return successResponse(res, result, 'Contacts retrieved successfully');
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
      
      return successResponse(res, contact, 'Contact retrieved successfully');
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
      
      return successResponse(res, contact, 'Contact retrieved successfully');
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
      
      return successResponse(res, contact, 'Contact updated successfully');
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
      
      return successResponse(res, result, 'Contact deleted successfully');
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
      
      return successResponse(res, stats, 'Contact statistics retrieved successfully');
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
      
      return successResponse(res, result, 'Customers retrieved successfully');
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
      
      return successResponse(res, result, 'Vendors retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ContactsController();