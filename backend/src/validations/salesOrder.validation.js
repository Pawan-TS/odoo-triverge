const Joi = require('joi');

const salesOrderLineSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  productId: Joi.number().integer().positive().required(),
  description: Joi.string().max(500).optional(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  discount: Joi.number().min(0).max(100).default(0),
  taxAmount: Joi.number().min(0).optional(),
  subtotal: Joi.number().min(0).optional()
});

const salesOrderSchema = Joi.object({
  contactId: Joi.number().integer().positive().required(),
  orderDate: Joi.date().iso().default(() => new Date()),
  expectedDate: Joi.date().iso().optional(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(1000).optional(),
  subtotal: Joi.number().min(0).optional(),
  totalTax: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),
  lines: Joi.array().items(salesOrderLineSchema).min(1).required()
});

const salesOrderUpdateSchema = Joi.object({
  contactId: Joi.number().integer().positive().optional(),
  orderDate: Joi.date().iso().optional(),
  expectedDate: Joi.date().iso().optional(),
  reference: Joi.string().max(100).optional(),
  notes: Joi.string().max(1000).optional(),
  subtotal: Joi.number().min(0).optional(),
  totalTax: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),
  lines: Joi.array().items(salesOrderLineSchema).optional()
});

const validateSalesOrder = (req, res, next) => {
  const { error } = salesOrderSchema.validate(req.body, { abortEarly: false });
  
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

const validateSalesOrderUpdate = (req, res, next) => {
  const { error } = salesOrderUpdateSchema.validate(req.body, { abortEarly: false });
  
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
  validateSalesOrder,
  validateSalesOrderUpdate,
  salesOrderSchema,
  salesOrderUpdateSchema
};