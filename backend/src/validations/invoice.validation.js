const Joi = require('joi');

const invoiceLineSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  productId: Joi.number().integer().positive().required(),
  description: Joi.string().max(500).optional(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  discount: Joi.number().min(0).max(100).default(0),
  taxRate: Joi.number().min(0).max(100).default(0),
  taxAmount: Joi.number().min(0).optional(),
  subtotal: Joi.number().min(0).optional()
});

const invoiceSchema = Joi.object({
  contactId: Joi.number().integer().positive().required(),
  salesOrderId: Joi.number().integer().positive().optional(),
  invoiceDate: Joi.date().iso().default(() => new Date()),
  dueDate: Joi.date().iso().optional(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(1000).optional(),
  subtotal: Joi.number().min(0).optional(),
  totalTax: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),
  lines: Joi.array().items(invoiceLineSchema).min(1).required()
});

const invoiceUpdateSchema = Joi.object({
  contactId: Joi.number().integer().positive().optional(),
  invoiceDate: Joi.date().iso().optional(),
  dueDate: Joi.date().iso().optional(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(1000).optional(),
  subtotal: Joi.number().min(0).optional(),
  totalTax: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),
  lines: Joi.array().items(invoiceLineSchema).optional()
});

const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().iso().default(() => new Date()),
  paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'other').required(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(500).optional()
});

const validateInvoice = (req, res, next) => {
  const { error } = invoiceSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  next();
};

const validateInvoiceUpdate = (req, res, next) => {
  const { error } = invoiceUpdateSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  next();
};

const validatePayment = (req, res, next) => {
  const { error } = paymentSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  next();
};

module.exports = {
  validateInvoice,
  validateInvoiceUpdate,
  validatePayment,
  invoiceSchema,
  invoiceUpdateSchema,
  paymentSchema
};