const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StockMovement = sequelize.define('StockMovement', {
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
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'reference_type'
  },
  referenceId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'reference_id'
  },
  movementDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'movement_date'
  },
  qty: {
    type: DataTypes.DECIMAL(18, 3),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(128),
    allowNull: true
  }
}, {
  tableName: 'stock_movements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = StockMovement;