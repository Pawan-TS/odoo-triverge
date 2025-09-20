const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentAllocation = sequelize.define('PaymentAllocation', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  paymentId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'payment_id'
  },
  invoiceId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'invoice_id'
  },
  vendorBillId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'vendor_bill_id'
  },
  allocatedAmount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    field: 'allocated_amount'
  }
}, {
  tableName: 'payment_allocations',
  timestamps: false
});

module.exports = PaymentAllocation;