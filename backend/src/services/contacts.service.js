const { Contact, Address, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { generateDocumentNumber } = require('../utils/sequences');
const { Op } = require('sequelize');

class ContactService {
  /**
   * Create a new contact
   */
  async createContact(data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Generate contact code if not provided
      if (!data.contactCode) {
        const prefix = data.contactType === 'customer' ? 'CUST' : 
                      data.contactType === 'vendor' ? 'VEND' : 'CONT';
        const result = await generateDocumentNumber(organizationId, prefix);
        data.contactCode = result.documentNumber;
      }

      // Validate unique contact code within organization
      const existingContact = await Contact.findOne({
        where: {
          organizationId,
          contactCode: data.contactCode
        }
      });

      if (existingContact) {
        throw new AppError('Contact code already exists', 400);
      }

      // Create contact
      const contactData = {
        ...data,
        organizationId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      const contact = await Contact.create(contactData, { transaction });

      // Create addresses if provided
      if (data.addresses && Array.isArray(data.addresses)) {
        const addressPromises = data.addresses.map(address => 
          Address.create({
            ...address,
            contactId: contact.id,
            organizationId
          }, { transaction })
        );
        await Promise.all(addressPromises);
      }

      await transaction.commit();

      // Fetch complete contact with addresses
      return await this.getContactById(contact.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get contact by ID
   */
  async getContactById(contactId, organizationId) {
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        organizationId,
        isActive: true
      },
      include: [
        {
          model: Address,
          as: 'addresses'
        }
      ]
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    return contact;
  }

  /**
   * Get all contacts with pagination and filtering
   */
  async getContacts(organizationId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      contactType,
      isActive,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const whereCondition = { organizationId };

    // Map sortBy to actual database column names
    const sortFieldMap = {
      'createdAt': 'created_at',
      'created_at': 'created_at',
      'contactName': 'name',
      'name': 'name',
      'contactType': 'contact_type',
      'contact_type': 'contact_type',
      'email': 'email',
      'phone': 'phone',
      'isActive': 'is_active',
      'is_active': 'is_active'
    };

    const actualSortBy = sortFieldMap[sortBy] || 'created_at';

    // Add filters
    if (search) {
      whereCondition[Op.or] = [
        { contactName: { [Op.like]: `%${search}%` } },
        { contactCode: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (contactType) {
      whereCondition.contactType = contactType;
    }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive;
    }

    const { count, rows } = await Contact.findAndCountAll({
      where: whereCondition,
      // TODO: Fix Address association issue
      // include: [
      //   {
      //     model: Address,
      //     as: 'addresses',
      //     required: false
      //   }
      // ],
      order: [[actualSortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      contacts: rows,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update contact
   */
  async updateContact(contactId, data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      const contact = await Contact.findOne({
        where: {
          id: contactId,
          organizationId
        }
      });

      if (!contact) {
        throw new AppError('Contact not found', 404);
      }

      // Check if contact code is being changed and validate uniqueness
      if (data.contactCode && data.contactCode !== contact.contactCode) {
        const existingContact = await Contact.findOne({
          where: {
            organizationId,
            contactCode: data.contactCode,
            id: { [Op.ne]: contactId }
          }
        });

        if (existingContact) {
          throw new AppError('Contact code already exists', 400);
        }
      }

      // Update contact
      await contact.update(data, { transaction });

      // Update addresses if provided
      if (data.addresses && Array.isArray(data.addresses)) {
        // Delete existing addresses
        await Address.destroy({
          where: {
            contactId: contact.id,
            organizationId
          },
          transaction
        });

        // Create new addresses
        const addressPromises = data.addresses.map(address => 
          Address.create({
            ...address,
            contactId: contact.id,
            organizationId
          }, { transaction })
        );
        await Promise.all(addressPromises);
      }

      await transaction.commit();

      // Return updated contact
      return await this.getContactById(contact.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete contact (soft delete)
   */
  async deleteContact(contactId, organizationId) {
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        organizationId
      }
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    // Check if contact is being used in any transactions
    // This would require checking Invoice, SalesOrder, etc. models
    // For now, we'll implement soft delete
    await contact.update({ isActive: false });

    return { message: 'Contact deactivated successfully' };
  }

  /**
   * Get contact by code
   */
  async getContactByCode(contactCode, organizationId) {
    const contact = await Contact.findOne({
      where: {
        contactCode,
        organizationId
      },
      include: [
        {
          model: Address,
          as: 'addresses'
        }
      ]
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    return contact;
  }

  /**
   * Get contact statistics
   */
  async getContactStats(organizationId) {
    const stats = await Contact.findAll({
      where: { organizationId },
      attributes: [
        'contactType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN isActive = 1 THEN 1 ELSE 0 END')), 'active']
      ],
      group: ['contactType'],
      raw: true
    });

    return stats.reduce((acc, stat) => {
      acc[stat.contactType] = {
        total: parseInt(stat.count),
        active: parseInt(stat.active)
      };
      return acc;
    }, {});
  }
}

module.exports = new ContactService();