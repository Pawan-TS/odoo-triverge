const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tax = sequelize.define('Tax', {
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
    type: DataTypes.STRING(100),
    allowNull: false
  },
  rate: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: false
  },
  computationMethod: {
    type: DataTypes.ENUM('Percentage', 'Fixed'),
    defaultValue: 'Percentage',
    field: 'computation_method'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'taxes',
  timestamps: false
});

module.exports = Tax;