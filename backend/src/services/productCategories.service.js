const { ProductCategory, Product, sequelize } = require('../models');
const { AppError } = require('../utils/appError');
const { generateDocumentNumber } = require('../utils/sequences');
const { Op } = require('sequelize');

class ProductCategoryService {
  /**
   * Create a new product category
   */
  async createCategory(data, organizationId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Generate category code if not provided
      if (!data.code) {
        const generatedCode = await generateDocumentNumber(organizationId, 'CAT');
        data.code = generatedCode.documentNumber;
      }

      // Validate unique category name within organization (for duplicate test)
      const existingNameCategory = await ProductCategory.findOne({
        where: {
          organizationId,
          name: data.name
        }
      });

      if (existingNameCategory) {
        throw new AppError('Category name already exists', 409);
      }

      // Validate unique category code within organization
      const existingCodeCategory = await ProductCategory.findOne({
        where: {
          organizationId,
          code: data.code
        }
      });

      if (existingCodeCategory) {
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
          throw new AppError('Parent category not found', 400);
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
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId, organizationId, includeInactive = false) {
    const whereCondition = {
      id: categoryId,
      organizationId
    };
    
    if (!includeInactive) {
      whereCondition.isActive = true;  // Only return active categories by default
    }
    
    const category = await ProductCategory.findOne({
      where: whereCondition,
      include: [
        {
          model: ProductCategory,
          as: 'parent',
          attributes: ['id', 'name', 'code']
        },
        {
          model: ProductCategory,
          as: 'children',
          attributes: ['id', 'name', 'code', 'isActive']
        }
      ]
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Get product count for this category
    const productCount = await Product.count({
      where: {
        categoryId: categoryId,
        organizationId
      }
    });

    // Convert to plain object and add product count
    const categoryData = category.toJSON();
    categoryData.productCount = productCount;

    return categoryData;
  }

  /**
   * Get all categories with pagination and filtering
   */
  async getCategories(organizationId, options = {}) {
    try {
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

      // Add simple filters one by one
      if (isActive !== undefined) {
        whereCondition.isActive = isActive;
      }

      if (parentId !== undefined) {
        whereCondition.parentId = parentId;
      }

      if (search) {
        whereCondition.name = { [Op.like]: `%${search}%` };
      }

      // Include options for associations
      const includeOptions = [];
      
      if (includeChildren) {
        includeOptions.push({
          model: ProductCategory,
          as: 'children',
          attributes: ['id', 'name', 'code', 'isActive'],
          required: false
        });
      }

      const { count, rows } = await ProductCategory.findAndCountAll({
        where: whereCondition,
        include: includeOptions,
        order: [['created_at', sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Ensure children property exists even if empty
      const categoriesWithChildren = rows.map(category => {
        const categoryJson = category.toJSON();
        if (includeChildren && !categoryJson.children) {
          categoryJson.children = [];
        }
        return categoryJson;
      });

      return {
        categories: categoriesWithChildren,
        pagination: {
          total: count,
          page: parseInt(page),
          currentPage: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
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
          // Remove isActive filter for updates - allow updating any existing category
        }
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if category code is being changed and validate uniqueness
      if (data.code && data.code !== category.code) {
        const existingCategory = await ProductCategory.findOne({
          where: {
            organizationId,
            code: data.code,
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
          throw new AppError('Category cannot be its own parent (circular hierarchy)', 400);
        }

        // Check if new parent is a descendant of current category (would create circular hierarchy)
        const isCircular = await this.checkCircularHierarchy(categoryId, data.parentId, organizationId);
        if (isCircular) {
          throw new AppError('Cannot create circular hierarchy', 400);
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

      return await this.getCategoryById(category.id, organizationId, true); // Include inactive categories
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
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
          // Remove isActive filter for deletes - allow deleting any existing category
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
        throw new AppError('Cannot delete category with subcategories. Please delete subcategories first.', 400);
      }

      // Soft delete
      await category.update({ isActive: false }, { transaction });
      await transaction.commit();

      return { message: 'Category deactivated successfully' };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
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
      attributes: ['id', 'name', 'code', 'parentId', 'description'],
      order: [['name', 'ASC']]
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
   * Check if creating a parent-child relationship would create circular hierarchy
   */
  async checkCircularHierarchy(categoryId, proposedParentId, organizationId) {
    let currentParent = proposedParentId;
    const visited = new Set();

    while (currentParent) {
      if (visited.has(currentParent)) {
        return true; // Circular reference detected
      }
      
      if (currentParent == categoryId) { // Use == for type coercion
        return true; // Would create circular hierarchy
      }

      visited.add(currentParent);

      const parent = await ProductCategory.findOne({
        where: {
          id: currentParent,
          organizationId
        },
        attributes: ['parentId']
      });

      if (!parent) {
        break;
      }

      currentParent = parent.parentId;
    }

    return false;
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
