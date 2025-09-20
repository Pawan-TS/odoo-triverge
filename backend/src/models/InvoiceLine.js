const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InvoiceLine = sequelize.define('InvoiceLine', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'invoice_id'
  },
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'product_id'
  },
  qty: {
    type: DataTypes.DECIMAL(14, 3),
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'unit_price'
  },
  taxId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'tax_id'
  },
  lineTotal: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    field: 'line_total'
  }
}, {
  tableName: 'invoice_lines',
  timestamps: false
});

module.exports = InvoiceLine;