const Joi = require('joi');

const paymentAllocationSchema = Joi.object({
  invoiceId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required()
});

const paymentSchema = Joi.object({
  contactId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().iso().default(() => new Date()),
  paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'other').required(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(500).optional(),
  type: Joi.string().valid('received', 'paid').default('received'),
  salesInvoiceId: Joi.number().integer().positive().optional(),
  allocations: Joi.array().items(paymentAllocationSchema).optional()
});

const paymentUpdateSchema = Joi.object({
  contactId: Joi.number().integer().positive().optional(),
  amount: Joi.number().positive().optional(),
  paymentDate: Joi.date().iso().optional(),
  paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'other').optional(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(500).optional(),
  allocations: Joi.array().items(paymentAllocationSchema).optional()
});

const paymentAllocationRequestSchema = Joi.object({
  allocations: Joi.array().items(paymentAllocationSchema).min(1).required()
});

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

const validatePaymentUpdate = (req, res, next) => {
  const { error } = paymentUpdateSchema.validate(req.body, { abortEarly: false });
  
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

const validatePaymentAllocation = (req, res, next) => {
  const { error } = paymentAllocationRequestSchema.validate(req.body, { abortEarly: false });
  
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
  validatePayment,
  validatePaymentUpdate,
  validatePaymentAllocation,
  paymentSchema,
  paymentUpdateSchema,
  paymentAllocationRequestSchema
};