/**
 * Application constants
 */

// User roles
const ROLES = {
  ADMIN: 'Admin',
  INVOICING: 'Invoicing'
};

// Contact types
const CONTACT_TYPES = {
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
  BOTH: 'Both'
};

// Product types
const PRODUCT_TYPES = {
  GOODS: 'Goods',
  SERVICE: 'Service'
};

// Account types
const ACCOUNT_TYPES = {
  ASSET: 'Asset',
  LIABILITY: 'Liability',
  EQUITY: 'Equity',
  INCOME: 'Income',
  EXPENSE: 'Expense'
};

// Tax computation methods
const TAX_COMPUTATION_METHODS = {
  PERCENTAGE: 'Percentage',
  FIXED: 'Fixed'
};

// Document types
const DOCUMENT_TYPES = {
  SALES_ORDER: 'SALES_ORDER',
  PURCHASE_ORDER: 'PURCHASE_ORDER',
  INVOICE: 'INVOICE',
  VENDOR_BILL: 'VENDOR_BILL',
  PAYMENT: 'PAYMENT',
  JOURNAL_ENTRY: 'JOURNAL_ENTRY'
};

// Sales order statuses
const SALES_ORDER_STATUS = {
  DRAFT: 'Draft',
  CONFIRMED: 'Confirmed',
  INVOICED: 'Invoiced',
  CANCELLED: 'Cancelled'
};

// Purchase order statuses
const PURCHASE_ORDER_STATUS = {
  DRAFT: 'Draft',
  CONFIRMED: 'Confirmed',
  RECEIVED: 'Received',
  CANCELLED: 'Cancelled'
};

// Invoice statuses
const INVOICE_STATUS = {
  DRAFT: 'Draft',
  AWAITING_PAYMENT: 'AwaitingPayment',
  PAID: 'Paid',
  VOID: 'Void'
};

// Vendor bill statuses
const VENDOR_BILL_STATUS = {
  DRAFT: 'Draft',
  AWAITING_PAYMENT: 'AwaitingPayment',
  PAID: 'Paid',
  VOID: 'Void'
};

// Address types
const ADDRESS_TYPES = {
  BILLING: 'Billing',
  SHIPPING: 'Shipping'
};

// Payment methods
const PAYMENT_METHODS = {
  CASH: 'Cash',
  BANK_TRANSFER: 'BankTransfer',
  CHEQUE: 'Cheque',
  CREDIT_CARD: 'CreditCard',
  DEBIT_CARD: 'DebitCard',
  UPI: 'UPI',
  WALLET: 'Wallet'
};

// Audit operations
const AUDIT_OPERATIONS = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};

// Journal entry reference types
const JOURNAL_REFERENCE_TYPES = {
  INVOICE: 'Invoice',
  VENDOR_BILL: 'VendorBill',
  PAYMENT: 'Payment',
  SALES_ORDER: 'SalesOrder',
  PURCHASE_ORDER: 'PurchaseOrder',
  STOCK_MOVEMENT: 'StockMovement',
  MANUAL: 'Manual'
};

// Stock movement reference types
const STOCK_REFERENCE_TYPES = {
  SALES_ORDER: 'SalesOrder',
  PURCHASE_ORDER: 'PurchaseOrder',
  INVOICE: 'Invoice',
  VENDOR_BILL: 'VendorBill',
  ADJUSTMENT: 'Adjustment'
};

// Default chart of accounts structure
const DEFAULT_COA = {
  ASSETS: {
    type: 'Asset',
    accounts: [
      { code: '1000', name: 'Cash', isBankAccount: false },
      { code: '1100', name: 'Bank Account', isBankAccount: true },
      { code: '1200', name: 'Accounts Receivable', isBankAccount: false },
      { code: '1300', name: 'Inventory', isBankAccount: false },
      { code: '1400', name: 'Prepaid Expenses', isBankAccount: false }
    ]
  },
  LIABILITIES: {
    type: 'Liability',
    accounts: [
      { code: '2000', name: 'Accounts Payable', isBankAccount: false },
      { code: '2100', name: 'Tax Payable', isBankAccount: false },
      { code: '2200', name: 'Input Tax Credit', isBankAccount: false },
      { code: '2300', name: 'Accrued Expenses', isBankAccount: false }
    ]
  },
  EQUITY: {
    type: 'Equity',
    accounts: [
      { code: '3000', name: 'Owner\'s Equity', isBankAccount: false },
      { code: '3100', name: 'Retained Earnings', isBankAccount: false }
    ]
  },
  INCOME: {
    type: 'Income',
    accounts: [
      { code: '4000', name: 'Sales Revenue', isBankAccount: false },
      { code: '4100', name: 'Service Revenue', isBankAccount: false },
      { code: '4200', name: 'Other Income', isBankAccount: false }
    ]
  },
  EXPENSES: {
    type: 'Expense',
    accounts: [
      { code: '5000', name: 'Cost of Goods Sold', isBankAccount: false },
      { code: '5100', name: 'Purchase Expenses', isBankAccount: false },
      { code: '5200', name: 'Operating Expenses', isBankAccount: false },
      { code: '5300', name: 'Administrative Expenses', isBankAccount: false }
    ]
  }
};

// Default tax rates (India)
const DEFAULT_TAXES = [
  { name: 'GST 0%', rate: 0.0000, computationMethod: 'Percentage' },
  { name: 'GST 5%', rate: 5.0000, computationMethod: 'Percentage' },
  { name: 'GST 12%', rate: 12.0000, computationMethod: 'Percentage' },
  { name: 'GST 18%', rate: 18.0000, computationMethod: 'Percentage' },
  { name: 'GST 28%', rate: 28.0000, computationMethod: 'Percentage' }
];

// Permission mappings
const PERMISSIONS = {
  CREATE_MASTER_DATA: 'create_master_data',
  EDIT_MASTER_DATA: 'edit_master_data',
  DELETE_MASTER_DATA: 'delete_master_data',
  CREATE_TRANSACTIONS: 'create_transactions',
  EDIT_TRANSACTIONS: 'edit_transactions',
  DELETE_TRANSACTIONS: 'delete_transactions',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  MANAGE_USERS: 'manage_users',
  MANAGE_ORGANIZATION: 'manage_organization',
  CREATE_JOURNAL_ENTRIES: 'create_journal_entries',
  VIEW_AUDIT_LOGS: 'view_audit_logs'
};

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

// File types allowed for uploads
const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  ARCHIVES: ['zip', 'rar', '7z']
};

// Currency codes (ISO 4217)
const CURRENCIES = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen'
};

// Timezone list (common ones)
const TIMEZONES = {
  'Asia/Kolkata': 'India Standard Time',
  'UTC': 'Coordinated Universal Time',
  'America/New_York': 'Eastern Time',
  'America/Los_Angeles': 'Pacific Time',
  'Europe/London': 'Greenwich Mean Time',
  'Asia/Dubai': 'Gulf Standard Time'
};

// Cache keys
const CACHE_KEYS = {
  HSN_LOOKUP: 'hsn:lookup:',
  USER_ROLES: 'user:roles:',
  ORGANIZATION_CONFIG: 'org:config:',
  PARTNER_BALANCE: 'partner:balance:',
  DASHBOARD_STATS: 'dashboard:stats:'
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  SHORT: 300,     // 5 minutes
  MEDIUM: 1800,   // 30 minutes
  LONG: 3600,     // 1 hour
  VERY_LONG: 86400 // 24 hours
};

module.exports = {
  ROLES,
  CONTACT_TYPES,
  PRODUCT_TYPES,
  ACCOUNT_TYPES,
  TAX_COMPUTATION_METHODS,
  DOCUMENT_TYPES,
  SALES_ORDER_STATUS,
  PURCHASE_ORDER_STATUS,
  INVOICE_STATUS,
  VENDOR_BILL_STATUS,
  ADDRESS_TYPES,
  PAYMENT_METHODS,
  AUDIT_OPERATIONS,
  JOURNAL_REFERENCE_TYPES,
  STOCK_REFERENCE_TYPES,
  DEFAULT_COA,
  DEFAULT_TAXES,
  PERMISSIONS,
  ERROR_CODES,
  ALLOWED_FILE_TYPES,
  CURRENCIES,
  TIMEZONES,
  CACHE_KEYS,
  CACHE_TTL
};