const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'organization_id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parentId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'parent_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'product_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProductCategory;