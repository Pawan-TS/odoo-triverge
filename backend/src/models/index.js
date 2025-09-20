const { sequelize } = require('../config/db');

// Import all models
const Organization = require('./Organization');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');
const Contact = require('./Contact');
const Address = require('./Address');
const Product = require('./Product');
const Tax = require('./Tax');
const ChartOfAccount = require('./ChartOfAccount');
const DocumentSequence = require('./DocumentSequence');
const SalesOrder = require('./SalesOrder');
const SalesOrderLine = require('./SalesOrderLine');
const Invoice = require('./Invoice');
const InvoiceLine = require('./InvoiceLine');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderLine = require('./PurchaseOrderLine');
const VendorBill = require('./VendorBill');
const VendorBillLine = require('./VendorBillLine');
const Payment = require('./Payment');
const PaymentAllocation = require('./PaymentAllocation');
const JournalEntry = require('./JournalEntry');
const JournalLine = require('./JournalLine');
const StockMovement = require('./StockMovement');
const Attachment = require('./Attachment');
const AuditLog = require('./AuditLog');
const PartnerBalance = require('./PartnerBalance');

// Define associations

// Organization associations
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
Organization.hasMany(Contact, { foreignKey: 'organizationId', as: 'contacts' });
Organization.hasMany(Product, { foreignKey: 'organizationId', as: 'products' });
Organization.hasMany(Tax, { foreignKey: 'organizationId', as: 'taxes' });
Organization.hasMany(ChartOfAccount, { foreignKey: 'organizationId', as: 'chartOfAccounts' });
Organization.hasMany(DocumentSequence, { foreignKey: 'organizationId', as: 'documentSequences' });
Organization.hasMany(SalesOrder, { foreignKey: 'organizationId', as: 'salesOrders' });
Organization.hasMany(Invoice, { foreignKey: 'organizationId', as: 'invoices' });
Organization.hasMany(PurchaseOrder, { foreignKey: 'organizationId', as: 'purchaseOrders' });
Organization.hasMany(VendorBill, { foreignKey: 'organizationId', as: 'vendorBills' });
Organization.hasMany(Payment, { foreignKey: 'organizationId', as: 'payments' });
Organization.hasMany(JournalEntry, { foreignKey: 'organizationId', as: 'journalEntries' });
Organization.hasMany(StockMovement, { foreignKey: 'organizationId', as: 'stockMovements' });
Organization.hasMany(Attachment, { foreignKey: 'organizationId', as: 'attachments' });
Organization.hasMany(PartnerBalance, { foreignKey: 'organizationId', as: 'partnerBalances' });

// User associations
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', as: 'roles' });

// Role associations
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', as: 'users' });

// UserRole associations
UserRole.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// Contact associations
Contact.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Contact.hasMany(Address, { foreignKey: 'contactId', as: 'addresses' });
Contact.hasMany(SalesOrder, { foreignKey: 'contactId', as: 'salesOrders' });
Contact.hasMany(Invoice, { foreignKey: 'contactId', as: 'invoices' });
Contact.hasMany(PurchaseOrder, { foreignKey: 'contactId', as: 'purchaseOrders' });
Contact.hasMany(VendorBill, { foreignKey: 'contactId', as: 'vendorBills' });
Contact.hasMany(Payment, { foreignKey: 'contactId', as: 'payments' });
Contact.hasOne(PartnerBalance, { foreignKey: 'contactId', as: 'partnerBalance' });

// Address associations
Address.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });

// Product associations
Product.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Product.belongsTo(Tax, { foreignKey: 'salesTaxId', as: 'salesTax' });
Product.hasMany(SalesOrderLine, { foreignKey: 'productId', as: 'salesOrderLines' });
Product.hasMany(InvoiceLine, { foreignKey: 'productId', as: 'invoiceLines' });
Product.hasMany(PurchaseOrderLine, { foreignKey: 'productId', as: 'purchaseOrderLines' });
Product.hasMany(VendorBillLine, { foreignKey: 'productId', as: 'vendorBillLines' });
Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });

// Tax associations
Tax.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Tax.hasMany(Product, { foreignKey: 'salesTaxId', as: 'products' });
Tax.hasMany(SalesOrderLine, { foreignKey: 'taxId', as: 'salesOrderLines' });
Tax.hasMany(InvoiceLine, { foreignKey: 'taxId', as: 'invoiceLines' });
Tax.hasMany(PurchaseOrderLine, { foreignKey: 'taxId', as: 'purchaseOrderLines' });
Tax.hasMany(VendorBillLine, { foreignKey: 'taxId', as: 'vendorBillLines' });

// Chart of Account associations
ChartOfAccount.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
ChartOfAccount.belongsTo(ChartOfAccount, { foreignKey: 'parentAccountId', as: 'parentAccount' });
ChartOfAccount.hasMany(ChartOfAccount, { foreignKey: 'parentAccountId', as: 'childAccounts' });
ChartOfAccount.hasMany(JournalLine, { foreignKey: 'accountId', as: 'journalLines' });
ChartOfAccount.hasMany(Payment, { foreignKey: 'bankAccountCoaId', as: 'payments' });

// Document Sequence associations
DocumentSequence.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Sales Order associations
SalesOrder.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
SalesOrder.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });
SalesOrder.hasMany(SalesOrderLine, { foreignKey: 'salesOrderId', as: 'lines' });
SalesOrder.hasMany(Invoice, { foreignKey: 'salesOrderId', as: 'invoices' });

// Sales Order Line associations
SalesOrderLine.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });
SalesOrderLine.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
SalesOrderLine.belongsTo(Tax, { foreignKey: 'taxId', as: 'tax' });

// Invoice associations
Invoice.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Invoice.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });
Invoice.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });
Invoice.hasMany(InvoiceLine, { foreignKey: 'invoiceId', as: 'lines' });
Invoice.hasMany(PaymentAllocation, { foreignKey: 'invoiceId', as: 'paymentAllocations' });

// Invoice Line associations
InvoiceLine.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
InvoiceLine.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InvoiceLine.belongsTo(Tax, { foreignKey: 'taxId', as: 'tax' });

// Purchase Order associations
PurchaseOrder.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
PurchaseOrder.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });
PurchaseOrder.hasMany(PurchaseOrderLine, { foreignKey: 'purchaseOrderId', as: 'lines' });
PurchaseOrder.hasMany(VendorBill, { foreignKey: 'purchaseOrderId', as: 'vendorBills' });

// Purchase Order Line associations
PurchaseOrderLine.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
PurchaseOrderLine.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
PurchaseOrderLine.belongsTo(Tax, { foreignKey: 'taxId', as: 'tax' });

// Vendor Bill associations
VendorBill.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
VendorBill.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });
VendorBill.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
VendorBill.hasMany(VendorBillLine, { foreignKey: 'vendorBillId', as: 'lines' });
VendorBill.hasMany(PaymentAllocation, { foreignKey: 'vendorBillId', as: 'paymentAllocations' });

// Vendor Bill Line associations
VendorBillLine.belongsTo(VendorBill, { foreignKey: 'vendorBillId', as: 'vendorBill' });
VendorBillLine.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
VendorBillLine.belongsTo(Tax, { foreignKey: 'taxId', as: 'tax' });

// Payment associations
Payment.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Payment.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });
Payment.belongsTo(ChartOfAccount, { foreignKey: 'bankAccountCoaId', as: 'bankAccount' });
Payment.hasMany(PaymentAllocation, { foreignKey: 'paymentId', as: 'allocations' });

// Payment Allocation associations
PaymentAllocation.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });
PaymentAllocation.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
PaymentAllocation.belongsTo(VendorBill, { foreignKey: 'vendorBillId', as: 'vendorBill' });

// Journal Entry associations
JournalEntry.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
JournalEntry.hasMany(JournalLine, { foreignKey: 'journalEntryId', as: 'lines' });

// Journal Line associations
JournalLine.belongsTo(JournalEntry, { foreignKey: 'journalEntryId', as: 'journalEntry' });
JournalLine.belongsTo(ChartOfAccount, { foreignKey: 'accountId', as: 'account' });

// Stock Movement associations
StockMovement.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Attachment associations
Attachment.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Partner Balance associations
PartnerBalance.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
PartnerBalance.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });

// Export all models
const models = {
  Organization,
  User,
  Role,
  UserRole,
  Contact,
  Address,
  Product,
  Tax,
  ChartOfAccount,
  DocumentSequence,
  SalesOrder,
  SalesOrderLine,
  Invoice,
  InvoiceLine,
  PurchaseOrder,
  PurchaseOrderLine,
  VendorBill,
  VendorBillLine,
  Payment,
  PaymentAllocation,
  JournalEntry,
  JournalLine,
  StockMovement,
  Attachment,
  AuditLog,
  PartnerBalance,
  sequelize
};

module.exports = models;