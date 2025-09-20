const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Invoice = sequelize.define('Invoice', {
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
  salesOrderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'sales_order_id'
  },
  documentNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'document_number'
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'invoice_date'
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
  tableName: 'invoices',
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

module.exports = Invoice;