const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChartOfAccount = sequelize.define('ChartOfAccount', {
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
  accountCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'account_code'
  },
  accountName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'account_name'
  },
  accountType: {
    type: DataTypes.ENUM('Asset', 'Liability', 'Equity', 'Income', 'Expense'),
    allowNull: false,
    field: 'account_type'
  },
  parentAccountId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'parent_account_id'
  },
  isBankAccount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_bank_account'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'chart_of_accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['organization_id', 'account_name']
    }
  ]
});

module.exports = ChartOfAccount;