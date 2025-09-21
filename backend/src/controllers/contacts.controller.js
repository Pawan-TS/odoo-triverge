const contactsService = require('../services/contacts.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { AppError } = require('../utils/appError');
const { Contact } = require('../models');

class ContactsController {
  /**
   * Get contact statistics
   */
  async getContactStatistics(req, res, next) {
    try {
      console.log('📊 getContactStatistics called for user:', req.user?.email);
      
      const statistics = await contactsService.getContactStatistics(req.user.organizationId);
      
      console.log('📊 Statistics result:', statistics);
      
      return sendSuccessResponse(res, statistics, 'Contact statistics retrieved successfully');
    } catch (error) {
      console.error('❌ Error in getContactStatistics:', error);
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Debug endpoint to check all contacts in database
   */
  async debugContacts(req, res, next) {
    try {
      console.log('🐛 Debug endpoint called');
      console.log('🐛 User context:', {
        userId: req.user?.id,
        organizationId: req.user?.organizationId,
        email: req.user?.email
      });
      
      // Get all contacts without organization filter
      const allContacts = await Contact.findAll({
        limit: 10,
        order: [['id', 'DESC']]
      });
      
      console.log('🐛 All contacts in database:', allContacts.map(c => ({
        id: c.id,
        name: c.name,
        organizationId: c.organizationId,
        contactCode: c.contactCode,
        contactType: c.contactType
      })));
      
      // Get contacts for current user's organization
      const userContacts = await Contact.findAll({
        where: { organizationId: req.user.organizationId },
        limit: 10,
        order: [['id', 'DESC']]
      });
      
      console.log('🐛 User organization contacts:', userContacts.map(c => ({
        id: c.id,
        name: c.name,
        organizationId: c.organizationId,
        contactCode: c.contactCode,
        contactType: c.contactType
      })));
      
      return sendSuccessResponse(res, 200, 'Debug data retrieved', {
        userOrganizationId: req.user.organizationId,
        allContactsCount: allContacts.length,
        userContactsCount: userContacts.length,
        allContacts: allContacts.map(c => ({
          id: c.id,
          name: c.name,
          organizationId: c.organizationId,
          contactCode: c.contactCode,
          contactType: c.contactType
        })),
        userContacts: userContacts.map(c => ({
          id: c.id,
          name: c.name,
          organizationId: c.organizationId,
          contactCode: c.contactCode,
          contactType: c.contactType
        }))
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get ALL contacts regardless of organization (for debugging)
   */
  async getAllContactsDebug(req, res, next) {
    try {
      console.log('🔓 getAllContactsDebug called - bypassing all filters');
      
      const allContacts = await Contact.findAll({
        order: [['created_at', 'DESC']],
        limit: 50
      });
      
      console.log('🔓 Found', allContacts.length, 'total contacts in database');
      
      const formattedContacts = allContacts.map(contact => ({
        id: contact.id,
        contactName: contact.contactName || contact.name,
        name: contact.name || contact.contactName,
        email: contact.email,
        phone: contact.phone,
        contactType: contact.contactType,
        contactCode: contact.contactCode,
        isActive: contact.isActive,
        organizationId: contact.organizationId,
        createdAt: contact.createdAt
      }));

      return sendSuccessResponse(res, 200, 'All contacts retrieved successfully', {
        contacts: formattedContacts,
        pagination: {
          total: allContacts.length,
          currentPage: 1,
          limit: 50,
          totalPages: 1
        }
      });
    } catch (error) {
      return next(error);
    }
  }
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
      console.log('🎯 ContactsController.getContacts called');
      console.log('🎯 User context:', {
        userId: req.user?.id,
        organizationId: req.user?.organizationId,
        email: req.user?.email
      });
      console.log('🎯 Query params:', req.query);
      
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

      console.log('🎯 Calling contactsService.getContacts with org:', organizationId);
      const result = await contactsService.getContacts(organizationId, options);
      
      console.log('🎯 Service returned:', {
        contactsCount: result.contacts?.length || 0,
        total: result.pagination?.total || 0
      });
      
      return sendSuccessResponse(res, 200, 'Contacts retrieved successfully', result);
    } catch (error) {
      console.error('🎯 ContactsController.getContacts error:', error);
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
        contactType: 'Customer'
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
        contactType: 'Vendor'
      };

      const result = await contactsService.getContacts(organizationId, options);
      
      return sendSuccessResponse(res, 200, 'Vendors retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ContactsController();
