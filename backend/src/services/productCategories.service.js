const { ProductCategory, Product, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { Op } = require('sequelize');

class ProductCategoryService {
  /**
   * Create a new product category
   */
  async createCategory(data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Generate category code if not provided
      if (!data.categoryCode) {
        data.categoryCode = await getNextSequence(organizationId, 'CAT');
      }

      // Validate unique category code within organization
      const existingCategory = await ProductCategory.findOne({
        where: {
          organizationId,
          categoryCode: data.categoryCode
        }
      });

      if (existingCategory) {
        throw new AppError('Category code already exists', 400);
      }

      // Validate parent category exists if provided
      if (data.parentId) {
        const parentCategory = await ProductCategory.findOne({
          where: {
            id: data.parentId,
            organizationId
          }
        });

        if (!parentCategory) {
          throw new AppError('Parent category not found', 404);
        }
      }

      // Create category
      const categoryData = {
        ...data,
        organizationId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      const category = await ProductCategory.create(categoryData, { transaction });
      await transaction.commit();

      return await this.getCategoryById(category.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId, organizationId) {
    const category = await ProductCategory.findOne({
      where: {
        id: categoryId,
        organizationId
      },
      include: [
        {
          model: ProductCategory,
          as: 'parent',
          attributes: ['id', 'categoryName', 'categoryCode']
        },
        {
          model: ProductCategory,
          as: 'children',
          attributes: ['id', 'categoryName', 'categoryCode', 'isActive']
        }
      ]
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  /**
   * Get all categories with pagination and filtering
   */
  async getCategories(organizationId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      parentId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeChildren = false
    } = options;

    const offset = (page - 1) * limit;
    const whereCondition = { organizationId };

    // Add filters
    if (search) {
      whereCondition[Op.or] = [
        { categoryName: { [Op.like]: `%${search}%` } },
        { categoryCode: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (parentId !== undefined) {
      whereCondition.parentId = parentId;
    }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive;
    }

    const includeOptions = [
      {
        model: ProductCategory,
        as: 'parent',
        attributes: ['id', 'categoryName', 'categoryCode']
      }
    ];

    if (includeChildren) {
      includeOptions.push({
        model: ProductCategory,
        as: 'children',
        attributes: ['id', 'categoryName', 'categoryCode', 'isActive']
      });
    }

    const { count, rows } = await ProductCategory.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      categories: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      const category = await ProductCategory.findOne({
        where: {
          id: categoryId,
          organizationId
        }
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if category code is being changed and validate uniqueness
      if (data.categoryCode && data.categoryCode !== category.categoryCode) {
        const existingCategory = await ProductCategory.findOne({
          where: {
            organizationId,
            categoryCode: data.categoryCode,
            id: { [Op.ne]: categoryId }
          }
        });

        if (existingCategory) {
          throw new AppError('Category code already exists', 400);
        }
      }

      // Validate parent category exists if being changed
      if (data.parentId && data.parentId !== category.parentId) {
        // Prevent circular reference
        if (data.parentId === categoryId) {
          throw new AppError('Category cannot be its own parent', 400);
        }

        const parentCategory = await ProductCategory.findOne({
          where: {
            id: data.parentId,
            organizationId
          }
        });

        if (!parentCategory) {
          throw new AppError('Parent category not found', 404);
        }
      }

      // Update category
      await category.update(data, { transaction });
      await transaction.commit();

      return await this.getCategoryById(category.id, organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(categoryId, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      const category = await ProductCategory.findOne({
        where: {
          id: categoryId,
          organizationId
        }
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if category has products
      const productCount = await Product.count({
        where: {
          categoryId: categoryId,
          organizationId
        }
      });

      if (productCount > 0) {
        throw new AppError('Cannot delete category with products. Please move products to another category first.', 400);
      }

      // Check if category has child categories
      const childrenCount = await ProductCategory.count({
        where: {
          parentId: categoryId,
          organizationId
        }
      });

      if (childrenCount > 0) {
        throw new AppError('Cannot delete category with child categories. Please delete child categories first.', 400);
      }

      // Soft delete
      await category.update({ isActive: false }, { transaction });
      await transaction.commit();

      return { message: 'Category deactivated successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get category tree structure
   */
  async getCategoryTree(organizationId) {
    const categories = await ProductCategory.findAll({
      where: {
        organizationId,
        isActive: true
      },
      attributes: ['id', 'categoryName', 'categoryCode', 'parentId', 'description'],
      order: [['categoryName', 'ASC']]
    });

    // Build tree structure
    const categoryMap = new Map();
    const roots = [];

    // First pass: create nodes
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category.toJSON(),
        children: []
      });
    });

    // Second pass: build tree
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(organizationId) {
    const totalCategories = await ProductCategory.count({
      where: { organizationId }
    });

    const activeCategories = await ProductCategory.count({
      where: { organizationId, isActive: true }
    });

    const categoriesWithProducts = await ProductCategory.count({
      where: { organizationId, isActive: true },
      include: [
        {
          model: Product,
          as: 'products',
          where: { isActive: true },
          required: true
        }
      ]
    });

    return {
      totalCategories,
      activeCategories,
      categoriesWithProducts
    };
  }
}

module.exports = new ProductCategoryService();