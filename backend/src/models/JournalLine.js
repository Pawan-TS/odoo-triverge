const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const JournalLine = sequelize.define('JournalLine', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  journalEntryId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'journal_entry_id'
  },
  accountId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'account_id'
  },
  debit: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0
  },
  credit: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0
  },
  description: {
    type: DataTypes.STRING(512),
    allowNull: true
  }
}, {
  tableName: 'journal_lines',
  timestamps: false
});

module.exports = JournalLine;