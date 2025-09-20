const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { validate, userSchema } = require('../utils/validator');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', 
  validate(userSchema.register), 
  authController.register
);

router.post('/login', 
  validate(userSchema.login), 
  authController.login
);

router.post('/refresh', 
  authController.refresh
);

router.post('/forgot-password', 
  authController.forgotPassword
);

router.post('/reset-password', 
  authController.resetPassword
);

// Protected routes (authentication required)
router.use(authMiddleware);

router.get('/profile', 
  authController.getProfile
);

router.put('/profile', 
  validate(userSchema.update), 
  authController.updateProfile
);

router.post('/change-password', 
  authController.changePassword
);

router.post('/logout', 
  authController.logout
);

router.get('/validate', 
  authController.validateToken
);

module.exports = router;