const { DocumentSequence } = require('../models');
const { sequelize } = require('../config/db');
const moment = require('moment');

/**
 * Generate next document number for a specific document type
 */
const generateDocumentNumber = async (organizationId, docType, transaction = null) => {
  try {
    const t = transaction || sequelize;
    
    // Lock the sequence row for update to prevent race conditions
    const sequence = await DocumentSequence.findOne({
      where: {
        organizationId,
        docType
      },
      lock: transaction ? true : transaction.LOCK.UPDATE,
      transaction: transaction || undefined
    });

    if (!sequence) {
      throw new Error(`Document sequence not found for type: ${docType}`);
    }

    const currentNumber = sequence.nextVal;
    const nextNumber = currentNumber + 1;

    // Update the sequence
    await sequence.update(
      { nextVal: nextNumber },
      { transaction: transaction || undefined }
    );

    // Format the document number
    const formattedNumber = formatDocumentNumber(
      sequence.formatMask,
      sequence.prefix,
      currentNumber
    );

    return {
      documentNumber: formattedNumber,
      sequenceNumber: currentNumber
    };
  } catch (error) {
    throw new Error(`Failed to generate document number: ${error.message}`);
  }
};

/**
 * Format document number based on format mask
 */
const formatDocumentNumber = (formatMask, prefix, sequenceNumber) => {
  const currentYear = moment().year();
  const currentMonth = moment().format('MM');
  
  let formatted = formatMask;
  
  // Replace placeholders
  formatted = formatted.replace(/\{prefix\}/g, prefix || '');
  formatted = formatted.replace(/\{year\}/g, currentYear);
  formatted = formatted.replace(/\{month\}/g, currentMonth);
  
  // Handle sequence number with padding
  const seqMatch = formatted.match(/\{seq:(\d+)d\}/);
  if (seqMatch) {
    const padding = parseInt(seqMatch[1]);
    const paddedSeq = sequenceNumber.toString().padStart(padding, '0');
    formatted = formatted.replace(seqMatch[0], paddedSeq);
  } else {
    formatted = formatted.replace(/\{seq\}/g, sequenceNumber);
  }
  
  return formatted;
};

/**
 * Create default document sequences for a new organization
 */
const createDefaultSequences = async (organizationId, transaction = null) => {
  const defaultSequences = [
    {
      docType: 'INVOICE',
      prefix: 'INV',
      formatMask: '{prefix}/{year}/{seq:06d}'
    },
    {
      docType: 'SALES_ORDER',
      prefix: 'SO',
      formatMask: '{prefix}/{year}/{seq:06d}'
    },
    {
      docType: 'PURCHASE_ORDER',
      prefix: 'PO',
      formatMask: '{prefix}/{year}/{seq:06d}'
    },
    {
      docType: 'VENDOR_BILL',
      prefix: 'BILL',
      formatMask: '{prefix}/{year}/{seq:06d}'
    },
    {
      docType: 'PAYMENT',
      prefix: 'PAY',
      formatMask: '{prefix}/{year}/{seq:06d}'
    },
    {
      docType: 'JOURNAL_ENTRY',
      prefix: 'JE',
      formatMask: '{prefix}/{year}/{seq:06d}'
    }
  ];

  const sequences = defaultSequences.map(seq => ({
    organizationId,
    ...seq,
    nextVal: 1
  }));

  await DocumentSequence.bulkCreate(sequences, { transaction });
};

/**
 * Get next preview number without incrementing sequence
 */
const previewNextNumber = async (organizationId, docType) => {
  const sequence = await DocumentSequence.findOne({
    where: {
      organizationId,
      docType
    }
  });

  if (!sequence) {
    throw new Error(`Document sequence not found for type: ${docType}`);
  }

  const nextNumber = sequence.nextVal;
  const formattedNumber = formatDocumentNumber(
    sequence.formatMask,
    sequence.prefix,
    nextNumber
  );

  return formattedNumber;
};

/**
 * Reset sequence number (admin function)
 */
const resetSequence = async (organizationId, docType, newValue = 1) => {
  const sequence = await DocumentSequence.findOne({
    where: {
      organizationId,
      docType
    }
  });

  if (!sequence) {
    throw new Error(`Document sequence not found for type: ${docType}`);
  }

  await sequence.update({ nextVal: newValue });
  return sequence;
};

/**
 * Update sequence format
 */
const updateSequenceFormat = async (organizationId, docType, updates) => {
  const sequence = await DocumentSequence.findOne({
    where: {
      organizationId,
      docType
    }
  });

  if (!sequence) {
    throw new Error(`Document sequence not found for type: ${docType}`);
  }

  const allowedUpdates = ['prefix', 'formatMask'];
  const updateData = {};
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  await sequence.update(updateData);
  return sequence;
};

/**
 * Validate format mask
 */
const validateFormatMask = (formatMask) => {
  const validPlaceholders = ['{prefix}', '{year}', '{month}', '{seq}'];
  const seqPattern = /\{seq:\d+d\}/;
  
  // Check if format mask contains at least {seq}
  if (!formatMask.includes('{seq}') && !seqPattern.test(formatMask)) {
    return false;
  }
  
  return true;
};

/**
 * Get all sequences for an organization
 */
const getOrganizationSequences = async (organizationId) => {
  return await DocumentSequence.findAll({
    where: { organizationId },
    order: [['docType', 'ASC']]
  });
};

module.exports = {
  generateDocumentNumber,
  formatDocumentNumber,
  createDefaultSequences,
  previewNextNumber,
  resetSequence,
  updateSequenceFormat,
  validateFormatMask,
  getOrganizationSequences
};