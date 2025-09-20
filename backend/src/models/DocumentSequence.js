const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DocumentSequence = sequelize.define('DocumentSequence', {
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
  docType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'doc_type'
  },
  prefix: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  nextVal: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
    field: 'next_val'
  },
  formatMask: {
    type: DataTypes.STRING(255),
    defaultValue: '{prefix}/{year}/{seq:06d}',
    field: 'format_mask'
  }
}, {
  tableName: 'document_sequences',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['organization_id', 'doc_type']
    }
  ]
});

module.exports = DocumentSequence;