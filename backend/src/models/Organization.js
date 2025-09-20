const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  uuidChar: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    unique: true,
    field: 'uuid_char'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  timezone: {
    type: DataTypes.STRING(64),
    defaultValue: 'UTC'
  },
  currency: {
    type: DataTypes.CHAR(3),
    defaultValue: 'INR'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'organizations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Organization;