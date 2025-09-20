const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VendorBill = sequelize.define('VendorBill', {
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
  purchaseOrderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'purchase_order_id'
  },
  documentNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'document_number'
  },
  billDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'bill_date'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'due_date'
  },
  status: {
    type: DataTypes.ENUM('Draft', 'AwaitingPayment', 'Paid', 'Void'),
    defaultValue: 'Draft'
  },
  subtotal: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0
  },
  totalTax: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'total_tax'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'total_amount'
  },
  amountDue: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'amount_due'
  }
}, {
  tableName: 'vendor_bills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['organization_id', 'document_number']
    }
  ]
});

module.exports = VendorBill;