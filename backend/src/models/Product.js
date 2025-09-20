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
  categoryId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'category_id'
  },
  type: {
    type: DataTypes.ENUM('consu', 'product', 'service'),
    allowNull: false,
    defaultValue: 'consu',
    field: 'product_type'
  },
  salePrice: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'sales_price',
    get() {
      const value = this.getDataValue('salePrice');
      return value ? parseFloat(value) : 0;
    }
  },
  costPrice: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'purchase_price',
    get() {
      const value = this.getDataValue('costPrice');
      return value ? parseFloat(value) : 0;
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'Unit'
  },
  minimumStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'minimum_stock',
    get() {
      const value = this.getDataValue('minimumStock');
      return value ? parseFloat(value) : 0;
    }
  },
  currentStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'current_stock',
    get() {
      const value = this.getDataValue('currentStock');
      return value ? parseFloat(value) : 0;
    }
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    get() {
      const value = this.getDataValue('weight');
      return value ? parseFloat(value) : null;
    }
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
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
  trackInventory: {
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