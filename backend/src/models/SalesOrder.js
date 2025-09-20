const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SalesOrder = sequelize.define('SalesOrder', {
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
  documentNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'document_number'
  },
  orderDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'order_date'
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Confirmed', 'Invoiced', 'Cancelled'),
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
  }
}, {
  tableName: 'sales_orders',
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

module.exports = SalesOrder;