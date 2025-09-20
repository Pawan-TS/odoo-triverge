const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attachment = sequelize.define('Attachment', {
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
  ownerTable: {
    type: DataTypes.STRING(64),
    allowNull: false,
    field: 'owner_table'
  },
  ownerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'owner_id'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type'
  },
  storageKey: {
    type: DataTypes.STRING(512),
    allowNull: false,
    field: 'storage_key'
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Attachment;