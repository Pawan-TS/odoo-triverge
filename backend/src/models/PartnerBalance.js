const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PartnerBalance = sequelize.define('PartnerBalance', {
  organizationId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    field: 'organization_id'
  },
  contactId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    field: 'contact_id'
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    field: 'outstanding_amount'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_updated'
  }
}, {
  tableName: 'partner_balances',
  timestamps: false
});

module.exports = PartnerBalance;