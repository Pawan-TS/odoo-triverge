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
  contactName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  contactCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'contact_code'
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
  isCompany: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_company'
  },
  vatNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'vat_number'
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
}).addHook('afterFind', (instances) => {
  // Add 'name' alias for 'contactName' in responses
  const addNameAlias = (instance) => {
    if (instance && instance.dataValues) {
      instance.dataValues.name = instance.dataValues.contactName;
    }
  };

  if (Array.isArray(instances)) {
    instances.forEach(addNameAlias);
  } else if (instances) {
    addNameAlias(instances);
  }
});

module.exports = Contact;