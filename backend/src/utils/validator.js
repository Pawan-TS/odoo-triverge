const Joi = require('joi');

/**
 * Validation schemas for different entities
 */

// Organization validation
const organizationSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    timezone: Joi.string().max(64).default('UTC'),
    currency: Joi.string().length(3).default('INR')
  })
};

// User validation
const userSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    firstName: Joi.string().max(100).required(),
    lastName: Joi.string().max(100).required(),
    phone: Joi.string().max(30).optional(),
    organizationName: Joi.string().min(2).max(255).required(),
    role: Joi.string().valid('Admin', 'Invoicing').optional().default('Admin')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  create: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    firstName: Joi.string().max(100).required(),
    lastName: Joi.string().max(100).required(),
    phone: Joi.string().max(30).optional(),
    roleIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
  }),
  
  update: Joi.object({
    email: Joi.string().email().optional(),
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
    phone: Joi.string().max(30).optional(),
    isActive: Joi.boolean().optional(),
    roleIds: Joi.array().items(Joi.number().integer().positive()).optional()
  })
};

// Contact validation
const contactSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    contactType: Joi.string().valid('Customer', 'Vendor', 'Both').required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(30).optional(),
    gstin: Joi.string().max(32).optional(),
    addresses: Joi.array().items(
      Joi.object({
        addressType: Joi.string().valid('Billing', 'Shipping').required(),
        line1: Joi.string().max(255).optional(),
        line2: Joi.string().max(255).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional(),
        pincode: Joi.string().max(20).optional(),
        country: Joi.string().max(100).default('India')
      })
    ).optional(),
    createUser: Joi.boolean().default(false)
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    contactType: Joi.string().valid('Customer', 'Vendor', 'Both').optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(30).optional(),
    gstin: Joi.string().max(32).optional(),
    isActive: Joi.boolean().optional()
  })
};

// Product validation
const productSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    sku: Joi.string().max(128).optional(),
    productType: Joi.string().valid('Goods', 'Service').default('Goods'),
    salesPrice: Joi.number().precision(2).min(0).default(0),
    purchasePrice: Joi.number().precision(2).min(0).default(0),
    hsnCode: Joi.string().max(64).optional(),
    salesTaxId: Joi.number().integer().positive().optional(),
    inventoryManaged: Joi.boolean().default(true),
    hsnLookup: Joi.boolean().default(false)
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    sku: Joi.string().max(128).optional(),
    productType: Joi.string().valid('Goods', 'Service').optional(),
    salesPrice: Joi.number().precision(2).min(0).optional(),
    purchasePrice: Joi.number().precision(2).min(0).optional(),
    hsnCode: Joi.string().max(64).optional(),
    salesTaxId: Joi.number().integer().positive().optional(),
    inventoryManaged: Joi.boolean().optional()
  })
};

// Tax validation
const taxSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    rate: Joi.number().precision(4).min(0).max(100).required(),
    computationMethod: Joi.string().valid('Percentage', 'Fixed').default('Percentage')
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    rate: Joi.number().precision(4).min(0).max(100).optional(),
    computationMethod: Joi.string().valid('Percentage', 'Fixed').optional(),
    isActive: Joi.boolean().optional()
  })
};

// Chart of Accounts validation
const coaSchema = {
  create: Joi.object({
    accountCode: Joi.string().max(50).optional(),
    accountName: Joi.string().min(2).max(255).required(),
    accountType: Joi.string().valid('Asset', 'Liability', 'Equity', 'Income', 'Expense').required(),
    parentAccountId: Joi.number().integer().positive().optional(),
    isBankAccount: Joi.boolean().default(false)
  }),
  
  update: Joi.object({
    accountCode: Joi.string().max(50).optional(),
    accountName: Joi.string().min(2).max(255).optional(),
    accountType: Joi.string().valid('Asset', 'Liability', 'Equity', 'Income', 'Expense').optional(),
    parentAccountId: Joi.number().integer().positive().optional(),
    isBankAccount: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
  })
};

// Sales Order validation
const salesOrderSchema = {
  create: Joi.object({
    contactId: Joi.number().integer().positive().required(),
    orderDate: Joi.date().iso().default(() => new Date()),
    currency: Joi.string().length(3).default('INR'),
    notes: Joi.string().max(1000).optional(),
    lines: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        qty: Joi.number().precision(3).min(0.001).required(),
        unitPrice: Joi.number().precision(2).min(0).required(),
        taxId: Joi.number().integer().positive().optional()
      })
    ).min(1).required()
  }),
  
  update: Joi.object({
    contactId: Joi.number().integer().positive().optional(),
    orderDate: Joi.date().iso().optional(),
    notes: Joi.string().max(1000).optional(),
    lines: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().optional(),
        productId: Joi.number().integer().positive().required(),
        qty: Joi.number().precision(3).min(0.001).required(),
        unitPrice: Joi.number().precision(2).min(0).required(),
        taxId: Joi.number().integer().positive().optional()
      })
    ).min(1).optional()
  })
};

// Invoice validation
const invoiceSchema = {
  create: Joi.object({
    contactId: Joi.number().integer().positive().required(),
    salesOrderId: Joi.number().integer().positive().optional(),
    invoiceDate: Joi.date().iso().default(() => new Date()),
    dueDate: Joi.date().iso().optional(),
    lines: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        qty: Joi.number().precision(3).min(0.001).required(),
        unitPrice: Joi.number().precision(2).min(0).required(),
        taxId: Joi.number().integer().positive().optional()
      })
    ).min(1).required()
  }),
  
  recordPayment: Joi.object({
    paymentMethod: Joi.string().max(50).required(),
    bankAccountCoaId: Joi.number().integer().positive().required(),
    amount: Joi.number().precision(2).min(0.01).required(),
    reference: Joi.string().max(255).optional(),
    idempotencyKey: Joi.string().max(255).optional()
  })
};

// Payment validation
const paymentSchema = {
  create: Joi.object({
    contactId: Joi.number().integer().positive().required(),
    paymentDate: Joi.date().iso().default(() => new Date()),
    amount: Joi.number().precision(2).min(0.01).required(),
    paymentMethod: Joi.string().max(50).required(),
    bankAccountCoaId: Joi.number().integer().positive().required(),
    reference: Joi.string().max(255).optional(),
    allocations: Joi.array().items(
      Joi.object({
        invoiceId: Joi.number().integer().positive().optional(),
        vendorBillId: Joi.number().integer().positive().optional(),
        allocatedAmount: Joi.number().precision(2).min(0.01).required()
      }).xor('invoiceId', 'vendorBillId')
    ).optional()
  })
};

// Journal Entry validation
const journalEntrySchema = {
  create: Joi.object({
    entryDate: Joi.date().iso().default(() => new Date()),
    description: Joi.string().max(512).required(),
    lines: Joi.array().items(
      Joi.object({
        accountId: Joi.number().integer().positive().required(),
        debit: Joi.number().precision(2).min(0).default(0),
        credit: Joi.number().precision(2).min(0).default(0),
        description: Joi.string().max(512).optional()
      }).custom((value, helpers) => {
        if (value.debit === 0 && value.credit === 0) {
          return helpers.error('custom.debitOrCredit');
        }
        if (value.debit > 0 && value.credit > 0) {
          return helpers.error('custom.notBoth');
        }
        return value;
      })
    ).min(2).required().custom((lines, helpers) => {
      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return helpers.error('custom.unbalanced');
      }
      
      return lines;
    })
  })
};

// HSN search validation
const hsnSchema = {
  search: Joi.object({
    q: Joi.string().min(1).max(255).required(),
    type: Joi.string().valid('byCode', 'byDesc').default('byCode'),
    category: Joi.string().valid('P', 'S').optional()
  })
};

// Query parameter validation
const querySchema = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  dateRange: Joi.object({
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    asOf: Joi.date().iso().optional()
  }),
  
  search: Joi.object({
    q: Joi.string().max(255).optional(),
    status: Joi.string().optional(),
    type: Joi.string().optional()
  })
};

/**
 * Validation middleware factory
 */
const   validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: 'Validation failed',
        data: { errors },
        timestamp: new Date().toISOString()
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = {
  organizationSchema,
  userSchema,
  contactSchema,
  productSchema,
  taxSchema,
  coaSchema,
  salesOrderSchema,
  invoiceSchema,
  paymentSchema,
  journalEntrySchema,
  hsnSchema,
  querySchema,
  validate
};