const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
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
  sku: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  productType: {
    type: DataTypes.ENUM('Goods', 'Service'),
    allowNull: false,
    defaultValue: 'Goods',
    field: 'product_type'
  },
  salesPrice: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'sales_price'
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'purchase_price'
  },
  hsnCode: {
    type: DataTypes.STRING(64),
    allowNull: true,
    field: 'hsn_code'
  },
  salesTaxId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'sales_tax_id'
  },
  inventoryManaged: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'inventory_managed'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Product;