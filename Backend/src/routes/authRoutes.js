'use strict';
import express from 'express';
import { register, login, logout, refreshToken, verifyEmail,
  resendVerificationEmail, sendResetPassword, resetPassword
 } from '../controllers/authController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
const router = express.Router();

const authRoutes = (app) => {
  // Register 
  router.post('/register', register);
  // Login
  router.post('/login', login);
  // Logout (requires valid access token)
  router.post('/logout', jwtAuth, logout);
  // Refresh token
  router.post('/refresh-token', refreshToken);

  router.get('/verify', verifyEmail);
  // Resend verification email
  router.post('/resend', resendVerificationEmail);
  // Send Reset Password Email
  router.post('/send-reset-password', sendResetPassword);
  // Reset Password - accept PATCH (preferred) and POST for frontend compatibility
  router.patch('/reset-password', resetPassword);

  app.use('/auth', router);
};

export default authRoutes;