const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  contactId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'contact_id'
  },
  addressType: {
    type: DataTypes.ENUM('Billing', 'Shipping'),
    allowNull: false,
    field: 'address_type'
  },
  line1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  line2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'India'
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Address;