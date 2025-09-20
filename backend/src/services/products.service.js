const { Product, ProductCategory, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { generateDocumentNumber } = require('../utils/sequences');
const { Op } = require('sequelize');

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Generate product code if not provided
      if (!data.productCode) {
        data.productCode = await generateDocumentNumber(organizationId, 'PROD');
      }

      // Validate unique product code within organization
      const existingProduct = await Product.findOne({
        where: {
          organizationId,
          productCode: data.productCode
        }
      });

      if (existingProduct) {
        throw new AppError('Product code already exists', 400);
      }

      // Validate category exists if provided
      if (data.categoryId) {
        const category = await ProductCategory.findOne({
          where: {
            id: data.categoryId,
            organizationId
          }
        });

        if (!category) {
          throw new AppError('Product category not found', 404);
        }
      }

      // Create product
      const productData = {
        ...data,
        organizationId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        currentStock: data.currentStock || 0
      };

      const product = await Product.create(productData, { transaction });
      await transaction.commit();

      return await this.getProductById(product.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId, organizationId) {
    const product = await Product.findOne({
      where: {
        id: productId,
        organizationId
      },
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'categoryName', 'categoryCode']
        }
      ]
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(organizationId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      productType,
      isActive,
      lowStock = false,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const whereCondition = { organizationId };

    // Add filters
    if (search) {
      whereCondition[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { productCode: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    if (productType) {
      whereCondition.productType = productType;
    }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive;
    }

    // Low stock filter
    if (lowStock) {
      whereCondition[Op.and] = sequelize.where(
        sequelize.col('currentStock'),
        Op.lte,
        sequelize.col('minimumStock')
      );
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'categoryName', 'categoryCode']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update product
   */
  async updateProduct(productId, data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      const product = await Product.findOne({
        where: {
          id: productId,
          organizationId
        }
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Check if product code is being changed and validate uniqueness
      if (data.productCode && data.productCode !== product.productCode) {
        const existingProduct = await Product.findOne({
          where: {
            organizationId,
            productCode: data.productCode,
            id: { [Op.ne]: productId }
          }
        });

        if (existingProduct) {
          throw new AppError('Product code already exists', 400);
        }
      }

      // Validate category exists if being changed
      if (data.categoryId && data.categoryId !== product.categoryId) {
        const category = await ProductCategory.findOne({
          where: {
            id: data.categoryId,
            organizationId
          }
        });

        if (!category) {
          throw new AppError('Product category not found', 404);
        }
      }

      // Update product
      await product.update(data, { transaction });
      await transaction.commit();

      return await this.getProductById(product.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(productId, organizationId) {
    const product = await Product.findOne({
      where: {
        id: productId,
        organizationId
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if product is being used in any transactions
    // This would require checking SalesOrderItem, InvoiceItem, etc. models
    // For now, we'll implement soft delete
    await product.update({ isActive: false });

    return { message: 'Product deactivated successfully' };
  }

  /**
   * Get product by code
   */
  async getProductByCode(productCode, organizationId) {
    const product = await Product.findOne({
      where: {
        productCode,
        organizationId
      },
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'categoryName', 'categoryCode']
        }
      ]
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Update product stock
   */
  async updateStock(productId, quantity, type, organizationId, notes = '') {
    const transaction = await sequelize.transaction();
    
    try {
      const product = await Product.findOne({
        where: {
          id: productId,
          organizationId
        }
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      let newStock;
      if (type === 'in') {
        newStock = product.currentStock + quantity;
      } else if (type === 'out') {
        newStock = product.currentStock - quantity;
        if (newStock < 0) {
          throw new AppError('Insufficient stock', 400);
        }
      } else {
        throw new AppError('Invalid stock movement type', 400);
      }

      // Update product stock
      await product.update({ currentStock: newStock }, { transaction });

      // Here you would typically create a stock movement record
      // const stockMovement = await StockMovement.create({...}, { transaction });

      await transaction.commit();

      return await this.getProductById(product.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(organizationId) {
    const products = await Product.findAll({
      where: {
        organizationId,
        isActive: true,
        [Op.and]: sequelize.where(
          sequelize.col('currentStock'),
          Op.lte,
          sequelize.col('minimumStock')
        )
      },
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'categoryName', 'categoryCode']
        }
      ],
      order: [['currentStock', 'ASC']]
    });

    return products;
  }

  /**
   * Get product statistics
   */
  async getProductStats(organizationId) {
    const totalProducts = await Product.count({
      where: { organizationId }
    });

    const activeProducts = await Product.count({
      where: { organizationId, isActive: true }
    });

    const lowStockCount = await Product.count({
      where: {
        organizationId,
        isActive: true,
        [Op.and]: sequelize.where(
          sequelize.col('currentStock'),
          Op.lte,
          sequelize.col('minimumStock')
        )
      }
    });

    const stockValue = await Product.sum('currentStock', {
      where: { organizationId, isActive: true }
    });

    return {
      totalProducts,
      activeProducts,
      lowStockCount,
      stockValue: stockValue || 0
    };
  }
}

module.exports = new ProductService();