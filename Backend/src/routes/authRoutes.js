'use strict';
import express from 'express';
import { register, login, logout, refreshToken, verifyEmail,
  resendVerificationEmail, sendResetPassword, resetPassword
 } from '../controllers/authController.js';
import { jwtAuth } from '../middleware/Auth/jwtAuth.js';
import { registerValidator, loginValidator, resetPasswordValidator } from '../middleware/Validator/ruleValidator.js';
import { validate } from '../middleware/Validator/validatorInput.js';
const router = express.Router();

const authRoutes = (app) => {
  
  // Register 
  router.post('/register', registerValidator, validate, register);

  // Login
  router.post('/login', loginValidator, validate, login);

  // Logout
  router.post('/logout', jwtAuth, logout);

  // Refresh token
  router.post('/refresh-token', refreshToken);

  // Verify Email
  router.get('/verify', verifyEmail);

  // Resend verification email
  router.post('/resend', resendVerificationEmail);

  // Send Reset Password Email
  router.post('/send-reset-password', sendResetPassword);
  
  // Reset Password 
  router.patch('/reset-password', resetPasswordValidator, validate, resetPassword);

  app.use('/auth', router);
};

export default authRoutes;