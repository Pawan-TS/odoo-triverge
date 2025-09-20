const { Tax, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { generateDocumentNumber } = require('../utils/sequences');
const { Op } = require('sequelize');

class TaxService {
  /**
   * Create a new tax
   */
  async createTax(data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Generate tax code if not provided
      if (!data.taxCode) {
        data.taxCode = await generateDocumentNumber(organizationId, 'TAX');
      }

      // Validate unique tax code within organization
      const existingTax = await Tax.findOne({
        where: {
          organizationId,
          taxCode: data.taxCode
        }
      });

      if (existingTax) {
        throw new AppError('Tax code already exists', 400);
      }

      // Create tax
      const taxData = {
        ...data,
        organizationId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      const tax = await Tax.create(taxData, { transaction });
      await transaction.commit();

      return tax;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get tax by ID
   */
  async getTaxById(taxId, organizationId) {
    const tax = await Tax.findOne({
      where: {
        id: taxId,
        organizationId
      }
    });

    if (!tax) {
      throw new AppError('Tax not found', 404);
    }

    return tax;
  }

  /**
   * Get all taxes with pagination and filtering
   */
  async getTaxes(organizationId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      taxType,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const whereCondition = { organizationId };

    // Add filters
    if (search) {
      whereCondition[Op.or] = [
        { taxName: { [Op.like]: `%${search}%` } },
        { taxCode: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (taxType) {
      whereCondition.taxType = taxType;
    }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive;
    }

    const { count, rows } = await Tax.findAndCountAll({
      where: whereCondition,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      taxes: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update tax
   */
  async updateTax(taxId, data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      const tax = await Tax.findOne({
        where: {
          id: taxId,
          organizationId
        }
      });

      if (!tax) {
        throw new AppError('Tax not found', 404);
      }

      // Check if tax code is being changed and validate uniqueness
      if (data.taxCode && data.taxCode !== tax.taxCode) {
        const existingTax = await Tax.findOne({
          where: {
            organizationId,
            taxCode: data.taxCode,
            id: { [Op.ne]: taxId }
          }
        });

        if (existingTax) {
          throw new AppError('Tax code already exists', 400);
        }
      }

      // Update tax
      await tax.update(data, { transaction });
      await transaction.commit();

      return tax;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete tax (soft delete)
   */
  async deleteTax(taxId, organizationId) {
    const tax = await Tax.findOne({
      where: {
        id: taxId,
        organizationId
      }
    });

    if (!tax) {
      throw new AppError('Tax not found', 404);
    }

    // Check if tax is being used in any transactions
    // This would require checking Product, Invoice, etc. models
    // For now, we'll implement soft delete
    await tax.update({ isActive: false });

    return { message: 'Tax deactivated successfully' };
  }

  /**
   * Get tax by code
   */
  async getTaxByCode(taxCode, organizationId) {
    const tax = await Tax.findOne({
      where: {
        taxCode,
        organizationId
      }
    });

    if (!tax) {
      throw new AppError('Tax not found', 404);
    }

    return tax;
  }

  /**
   * Get active taxes for dropdowns
   */
  async getActiveTaxes(organizationId) {
    const taxes = await Tax.findAll({
      where: {
        organizationId,
        isActive: true
      },
      attributes: ['id', 'taxName', 'taxCode', 'taxRate', 'taxType'],
      order: [['taxName', 'ASC']]
    });

    return taxes;
  }

  /**
   * Calculate tax amount
   */
  calculateTaxAmount(baseAmount, taxRate, taxType = 'exclusive') {
    if (taxType === 'inclusive') {
      // Tax is included in the base amount
      const taxAmount = (baseAmount * taxRate) / (100 + taxRate);
      const netAmount = baseAmount - taxAmount;
      return {
        netAmount: parseFloat(netAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        grossAmount: parseFloat(baseAmount.toFixed(2))
      };
    } else {
      // Tax is exclusive (added to base amount)
      const taxAmount = (baseAmount * taxRate) / 100;
      const grossAmount = baseAmount + taxAmount;
      return {
        netAmount: parseFloat(baseAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        grossAmount: parseFloat(grossAmount.toFixed(2))
      };
    }
  }

  /**
   * Get tax statistics
   */
  async getTaxStats(organizationId) {
    const totalTaxes = await Tax.count({
      where: { organizationId }
    });

    const activeTaxes = await Tax.count({
      where: { organizationId, isActive: true }
    });

    const gstTaxes = await Tax.count({
      where: { organizationId, taxType: 'GST', isActive: true }
    });

    const vatTaxes = await Tax.count({
      where: { organizationId, taxType: 'VAT', isActive: true }
    });

    return {
      totalTaxes,
      activeTaxes,
      gstTaxes,
      vatTaxes
    };
  }

  /**
   * Create default taxes for organization
   */
  async createDefaultTaxes(organizationId) {
    const defaultTaxes = [
      {
        taxName: 'GST 5%',
        taxCode: 'GST5',
        taxRate: 5.00,
        taxType: 'GST',
        description: 'Goods and Services Tax - 5%',
        organizationId,
        isActive: true
      },
      {
        taxName: 'GST 12%',
        taxCode: 'GST12',
        taxRate: 12.00,
        taxType: 'GST',
        description: 'Goods and Services Tax - 12%',
        organizationId,
        isActive: true
      },
      {
        taxName: 'GST 18%',
        taxCode: 'GST18',
        taxRate: 18.00,
        taxType: 'GST',
        description: 'Goods and Services Tax - 18%',
        organizationId,
        isActive: true
      },
      {
        taxName: 'GST 28%',
        taxCode: 'GST28',
        taxRate: 28.00,
        taxType: 'GST',
        description: 'Goods and Services Tax - 28%',
        organizationId,
        isActive: true
      },
      {
        taxName: 'IGST 18%',
        taxCode: 'IGST18',
        taxRate: 18.00,
        taxType: 'IGST',
        description: 'Integrated Goods and Services Tax - 18%',
        organizationId,
        isActive: true
      },
      {
        taxName: 'Exempt',
        taxCode: 'EXEMPT',
        taxRate: 0.00,
        taxType: 'EXEMPT',
        description: 'Tax Exempt',
        organizationId,
        isActive: true
      }
    ];

    const transaction = await sequelize.transaction();
    
    try {
      await Tax.bulkCreate(defaultTaxes, { transaction });
      await transaction.commit();
      
      return { message: 'Default taxes created successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new TaxService();