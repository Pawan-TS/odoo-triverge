const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const JournalEntry = sequelize.define('JournalEntry', {
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
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'entry_date'
  },
  description: {
    type: DataTypes.STRING(512),
    allowNull: true
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
  }
}, {
  tableName: 'journal_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = JournalEntry;