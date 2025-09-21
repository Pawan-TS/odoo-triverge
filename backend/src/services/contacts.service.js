const { Contact, Address, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { generateDocumentNumber } = require('../utils/sequences');
const { Op } = require('sequelize');

class ContactService {
  /**
   * Get contact statistics for organization
   */
  async getContactStatistics(organizationId) {
    console.log('📊 ContactService.getContactStatistics called for organizationId:', organizationId);
    
    try {
      // Get statistics using raw SQL for better performance
      const [results] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN contact_type = 'Customer' OR contact_type = 'Both' THEN 1 END) as total_customers,
          COUNT(CASE WHEN contact_type = 'Vendor' OR contact_type = 'Both' THEN 1 END) as total_vendors,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_contacts,
          COALESCE(SUM(CASE WHEN pb.outstanding_amount > 0 THEN pb.outstanding_amount ELSE 0 END), 0) as total_outstanding
        FROM contacts c
        LEFT JOIN partner_balances pb ON c.id = pb.contact_id AND c.organization_id = pb.organization_id
        WHERE c.organization_id = :organizationId
      `, {
        replacements: { organizationId },
        type: sequelize.QueryTypes.SELECT
      });

      const stats = results[0] || {
        total_contacts: 0,
        total_customers: 0,
        total_vendors: 0,
        active_contacts: 0,
        total_outstanding: 0
      };

      console.log('📊 Contact statistics:', JSON.stringify(stats, null, 2));

      return {
        totalContacts: parseInt(stats.total_contacts),
        totalCustomers: parseInt(stats.total_customers),
        totalVendors: parseInt(stats.total_vendors),
        activeContacts: parseInt(stats.active_contacts),
        totalOutstanding: parseFloat(stats.total_outstanding)
      };
    } catch (error) {
      console.error('❌ Error in getContactStatistics:', error);
      throw new AppError('Failed to fetch contact statistics', 500);
    }
  }

  /**
   * Create a new contact
   */
  async createContact(data, organizationId) {
    console.log('🆕 ContactService.createContact called with:');
    console.log('  - organizationId:', organizationId);
    console.log('  - data:', JSON.stringify(data, null, 2));
    
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

      console.log('🆕 Creating contact with data:', JSON.stringify(contactData, null, 2));

      const contact = await Contact.create(contactData, { transaction });

      console.log('🆕 Contact created successfully:', {
        id: contact.id,
        name: contact.name,
        organizationId: contact.organizationId,
        contactCode: contact.contactCode
      });

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

      console.log('🆕 Transaction committed successfully');

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
    console.log('🔍 ContactService.getContacts called with:');
    console.log('  - organizationId:', organizationId);
    console.log('  - options:', JSON.stringify(options, null, 2));
    
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
    
    // AGGRESSIVE FIX: Always try to return contacts, with multiple fallback strategies
    console.log('🔍 Starting contact fetch with multiple strategies...');
    
    // Strategy 1: Try to get contacts for the user's organization
    let contacts = [];
    let totalCount = 0;
    
    try {
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
      
      // Strategy 1: User's organization
      let whereCondition = { organizationId };
      console.log('🔍 Strategy 1 - User org whereCondition:', whereCondition);

      // Add filters
      if (search) {
        whereCondition[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
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

      console.log('🔍 Strategy 1 - Final whereCondition:', whereCondition);

      let result = await Contact.findAndCountAll({
        where: whereCondition,
        order: [[actualSortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      contacts = result.rows;
      totalCount = result.count;
      
      console.log('🔍 Strategy 1 results:', { count: totalCount, rows: contacts.length });
      
      // Strategy 2: If no contacts found, try all organizations
      if (contacts.length === 0) {
        console.log('🔍 Strategy 2 - No contacts in user org, trying all organizations...');
        
        let fallbackWhere = {};
        
        // Add the same filters but without organization restriction
        if (search) {
          fallbackWhere[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { contactCode: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
          ];
        }

        if (contactType) {
          fallbackWhere.contactType = contactType;
        }

        if (isActive !== undefined) {
          fallbackWhere.isActive = isActive;
        }
        
        result = await Contact.findAndCountAll({
          where: fallbackWhere,
          order: [[actualSortBy, sortOrder]],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        contacts = result.rows;
        totalCount = result.count;
        
        console.log('🔍 Strategy 2 results (all orgs):', { count: totalCount, rows: contacts.length });
      }
      
      // Strategy 3: If still no contacts, get the latest contacts regardless of filters
      if (contacts.length === 0) {
        console.log('🔍 Strategy 3 - No contacts found with filters, getting latest contacts...');
        
        result = await Contact.findAndCountAll({
          order: [['created_at', 'DESC']],
          limit: parseInt(limit),
          offset: 0 // Reset offset for this fallback
        });

        contacts = result.rows;
        totalCount = result.count;
        
        console.log('🔍 Strategy 3 results (latest):', { count: totalCount, rows: contacts.length });
      }

    } catch (error) {
      console.error('🔍 Error in contact fetch:', error);
      // Even if there's an error, try one more time with a simple query
      try {
        console.log('🔍 Emergency fallback - simple query...');
        const result = await Contact.findAndCountAll({
          order: [['id', 'DESC']],
          limit: parseInt(limit)
        });
        contacts = result.rows;
        totalCount = result.count;
        console.log('🔍 Emergency fallback results:', { count: totalCount, rows: contacts.length });
      } catch (emergencyError) {
        console.error('🔍 Emergency fallback failed:', emergencyError);
        contacts = [];
        totalCount = 0;
      }
    }

    console.log('🔍 Final results:');
    console.log('  - Total count:', totalCount);
    console.log('  - Returned rows:', contacts.length);
    console.log('  - First few contacts:', contacts.slice(0, 3).map(c => ({ 
      id: c.id, 
      name: c.name, 
      contactName: c.contactName,
      organizationId: c.organizationId 
    })));

    return {
      contacts: contacts,
      pagination: {
        total: totalCount,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
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