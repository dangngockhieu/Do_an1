import * as authService from '../services/authService.js';
import dotenv from 'dotenv';
dotenv.config();
// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    await authService.register(email, name, password);
    return res.status(200).json({
      EM: 'Registration successful', EC: 0
    });
  } catch (err) {
    return res.status(500).json({
      EC: -1, EM: err.message || 'Server Internal Error'
    });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.validateUser(email, password);
    if (!user) {
        return res.status(401).json({ EM: 'Email hoặc mật khẩu không chính xác', EC: 1 });
    }
    const data = await authService.login(user);
    const isProd = process.env.NODE_ENV === 'production';
    if (req.cookies?.refresh_token) {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        domain: isProd ? '.techzone.vn' : undefined
      });
    }
    res.cookie('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: isProd,                      
      sameSite: isProd ? 'none' : 'lax',   
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: isProd ? '.techzone.vn' : undefined  
    });
    return res.status(200).json({
        DT: {
        access_token: data.access_token,
        user: data.user,
      }, EM: 'Login successful', EC: 0
    });
  } catch (err) {
    return res.status(500).json({
      EC: -1, EM: err.message || 'Server Internal Error'
    });
  }
};

// ==================== LOGOUT  ====================
export const logout = async (req, res) => {
  try {
    const email = req.user.email;
    await authService.logout(email);
    const isProd = process.env.NODE_ENV === 'production';
    if (req.cookies?.refresh_token) {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        domain: isProd ? '.techzone.vn' : undefined  
      });
    }
    return res.status(200).json({
      EM: 'Logout successful', EC: 0
    });
  } catch (err) {
    return res.status(500).json({
      EC: -1, EM: err.message || 'Server Internal Error'
    });
  }      
};

// ==================== REFRESH TOKEN ====================
export const refreshToken = async (req, res) => {
  try {
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token) {
      return res.status(401).json({ EM: 'No refresh token provided', EC: 1 });
    }
    const data = await authService.postrefresh_token(refresh_token);
    return res.status(200).json({ DT: { access_token: data.access_token, user: data.user }, 
          EM: 'Refresh token successful', 
          EC: 0 });
    } catch (err) {
    return res.status(401).json({
      EC: -1, EM: err.message || 'Server Internal Error'
    });
  }
};

// ==================== VERIFY EMAIL ====================
export const verifyEmail = async (req, res) => {
    try {
        const { email, token } = req.query;
        const data = await authService.verifyByToken(token, email);
        if (data === 'Email verified') {
        res.setHeader(
        'Content-Security-Policy',
        "default-src * 'self' data: blob:; connect-src *; img-src * data:; style-src * 'unsafe-inline';"
      );
        res.send(`
    <!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Đã xác thực email</title>
          <style>
            body { margin:0; padding:0; background:#f5f7fb; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; color:#333; }
            .wrap { width:100%; max-width:600px; margin:28px auto; }
            .card { background:#fff; border-radius:12px; box-shadow:0 6px 18px rgba(16,24,40,0.06); overflow:hidden; }
            .hero { padding:28px; text-align:center; background:linear-gradient(90deg,#6ee7b7,#3b82f6); color:#04263a; }
            .hero h1 { margin:8px 0 0 0; font-size:20px; line-height:1.1; }
            .content { padding:26px; }
            .message { font-size:15px; line-height:1.6; color:#4b5563; margin:0 0 18px 0; }
            .meta { font-size:13px; color:#9ca3af; margin-top:16px; }
            .footer { padding:18px; text-align:center; font-size:13px; color:#9ca3af; }
            @media (max-width:420px){ .hero{padding:20px} .content{padding:18px} }
          </style>
        </head>
        <body>
          <div style="display:none;visibility:hidden;opacity:0;height:0;width:0;">Email của bạn đã được xác thực — bạn có thể đăng nhập ngay.</div>
            <div class="wrap">
              <div class="card" role="article" aria-roledescription="email">
                <div class="hero">
                  <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
                    <div style="text-align:left;">
                      <div style="font-size:13px; color:rgba(4,38,58,0.85);">Xác thực thành công</div>
                      <h1>Email đã được xác thực</h1>
                    </div>
                  </div>
                </div>
                <div class="content">
                  <p class="message">
                    Cảm ơn bạn — địa chỉ email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập và bắt đầu trải nghiệm mua sắm tại <strong>TechZone</strong>.
                  </p>
                  <p class="meta">
                    Nếu bạn không thực hiện yêu cầu này hoặc cần trợ giúp, hãy liên hệ: 
                    <a href="mailto:laptopshop8386@gmail.com">laptopshop8386@gmail.com</a>
                  </p>
                </div>
                <div style="border-top:1px solid #f1f5f9; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
                  <div style="font-size:13px; color:#6b7280;">© <span id="year">2025</span> TechZone</div>
                  <div style="font-size:13px; color:#6b7280;">An toàn &amp; Bảo mật</div>
                </div>
              </div>
              <div class="footer">
                Chúc bạn một ngày tốt lành
              </div>
          </div>
        </body>
      </html>
    `);
      } else {
        res.status(401).json({ EM: 'Invalid or expired verification token' });
      }
    } catch (error) {
        res.status(500).json({ EM: error.message || 'Server Internal Error' });
    }
};

// ==================== RESEND VERIFY EMAIL ====================
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.resendVerificationEmail(email);
    return res.status(200).json({
      EM: 'Verification email resent', EC: 0
    });
  } catch (err) {
    return res.status(500).json({
      EC: -1, EM: err.message || 'Server Internal Error'
    });
  }
};

// ==================== SEND RESET PASSWORD ====================
export const sendResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.sendPasswordResetEmail(email);
    return res.status(200).json({
      EM: 'Password reset email sent', EC: 0
    });
  } catch (err) {
    return res.status(500).json({
      EC: -1, EM: err.message || 'Server Internal Error'
    });
  }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        await authService.resetPassword(email, code, newPassword);
        return res.status(200).json({
            EM: 'Password reset successfully', EC: 0
        });
    } catch (err) {
        return res.status(500).json({
            EC: -1, EM: err.message || 'Server Internal Error'
        });
    }
};