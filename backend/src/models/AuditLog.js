const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'organization_id'
  },
  tableName: {
    type: DataTypes.STRING(128),
    allowNull: false,
    field: 'table_name'
  },
  recordId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'record_id'
  },
  operation: {
    type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  changedBy: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'changed_by'
  },
  changeData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'change_data'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuditLog;