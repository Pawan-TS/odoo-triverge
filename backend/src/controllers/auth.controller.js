const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validate, userSchema } = require('../utils/validator');
const { 
  success, 
  created, 
  badRequest, 
  unauthorized, 
  validationError 
} = require('../utils/response');

class AuthController {
  /**
   * Register new organization and admin user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    
    return created(res, result, 'Organization and user registered successfully');
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    
    return success(res, result, 'Login successful');
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return badRequest(res, 'Refresh token required');
    }

    const result = await authService.refreshToken(refreshToken);
    
    return success(res, result, 'Token refreshed successfully');
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const result = await authService.getProfile(req.user.id);
    
    return success(res, result, 'Profile retrieved successfully');
  });

  /**
   * Update current user profile
   * PUT /api/v1/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const result = await authService.updateProfile(req.user.id, req.body);
    
    return success(res, result, 'Profile updated successfully');
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return badRequest(res, 'Current password and new password are required');
    }

    const result = await authService.changePassword(req.user.id, req.body);
    
    return success(res, result, 'Password changed successfully');
  });

  /**
   * Logout user (client-side token deletion)
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    // In a more advanced implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Delete refresh token from database
    // 3. Log the logout event
    
    return success(res, null, 'Logout successful');
  });

  /**
   * Forgot password (placeholder for future implementation)
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return badRequest(res, 'Email is required');
    }

    // TODO: Implement password reset logic
    // 1. Generate reset token
    // 2. Send email with reset link
    // 3. Store token in database with expiry
    
    return success(res, null, 'Password reset instructions sent to email');
  });

  /**
   * Reset password (placeholder for future implementation)
   * POST /api/v1/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return badRequest(res, 'Reset token and new password are required');
    }

    // TODO: Implement password reset logic
    // 1. Verify reset token
    // 2. Check token expiry
    // 3. Update user password
    // 4. Invalidate reset token
    
    return success(res, null, 'Password reset successfully');
  });

  /**
   * Validate token (for frontend to check if token is still valid)
   * GET /api/v1/auth/validate
   */
  validateToken = asyncHandler(async (req, res) => {
    // If we reach here, the auth middleware has already validated the token
    return success(res, { valid: true }, 'Token is valid');
  });
}

module.exports = new AuthController();