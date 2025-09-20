const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate secure random token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash string using SHA256
 */
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate UUID v4
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Encrypt data using AES-256-GCM
 */
const encrypt = (text, key) => {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt data using AES-256-GCM
 */
const decrypt = (encryptedData, key) => {
  const algorithm = 'aes-256-gcm';
  const { encrypted, iv, authTag } = encryptedData;
  
  const decipher = crypto.createDecipher(algorithm, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Create HMAC signature
 */
const createSignature = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 */
const verifySignature = (data, signature, secret) => {
  const expectedSignature = createSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Mask sensitive data
 */
const maskString = (str, visibleLength = 4, maskChar = '*') => {
  if (!str || str.length <= visibleLength) {
    return str;
  }
  
  const visiblePart = str.slice(-visibleLength);
  const maskedPart = maskChar.repeat(str.length - visibleLength);
  
  return maskedPart + visiblePart;
};

/**
 * Mask email address
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) {
    return email;
  }
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 2 
    ? username[0] + '*'.repeat(username.length - 2) + username.slice(-1)
    : username;
    
  return `${maskedUsername}@${domain}`;
};

/**
 * Mask phone number
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 4) {
    return phone;
  }
  
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomString,
  generateToken,
  hashString,
  generateUUID,
  encrypt,
  decrypt,
  createSignature,
  verifySignature,
  generateOTP,
  maskString,
  maskEmail,
  maskPhone
};