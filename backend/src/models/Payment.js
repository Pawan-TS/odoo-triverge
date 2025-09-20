const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
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
  contactId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'contact_id'
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'payment_date'
  },
  amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  },
  bankAccountCoaId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'bank_account_coa_id'
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Payment;