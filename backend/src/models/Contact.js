const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Contact = sequelize.define('Contact', {
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
  uuidChar: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'uuid_char'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contactType: {
    type: DataTypes.ENUM('Customer', 'Vendor', 'Both'),
    allowNull: false,
    field: 'contact_type'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  gstin: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Contact;