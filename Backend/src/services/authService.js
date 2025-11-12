'use strict';
import argon from 'argon2';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { v4 as uuid4 } from 'uuid';
import prisma from '../lib/prisma.js';
import transporter from '../config/mailer.js';
import dotenv from 'dotenv';
dotenv.config();

// ==================== GỬI EMAIL XÁC THỰC ====================
const sendVerificationEmail = async (email, name, token) => {
    const baseUrl = process.env.VERIFY_BASE_URL;
    const separator = baseUrl.includes('?') ? '&' : '?';
    const verifyUrl = `${baseUrl}${separator}token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Xác thực tài khoản TechZone',
      html: `
        <!doctype html>
      <html lang="vi">
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>Xác thực tài khoản đăng ký</title>
      <style>
    body { margin:0; padding:0; background-color:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .header { padding:20px; text-align:center; background:linear-gradient(90deg,#1e90ff,#3fb0ff); color:#fff; }
    .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; }
    .content { padding:28px; color:#333333; line-height:1.5; }
    .btn { display:inline-block; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:600; }
    .btn-primary { background:#1e90ff; color:#ffffff; }
    .note { font-size:13px; color:#666666; margin-top:18px; }
    .footer { padding:18px; font-size:13px; color:#999999; text-align:center; }
    @media (max-width:420px){ .content { padding:18px; } .header{padding:14px} }
  </style>
</head>
<body>
  <!-- Preheader (hiện tóm tắt trong inbox) -->
  <div class="preheader">Xác thực email của bạn để hoàn tất đăng ký.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <h1 style="margin:0; font-size:20px;">Xác thực email</h1>
            </td>
          </tr>

          <tr>
            <td class="content">
              <p style="margin:0 0 12px 0;">Chào <strong>${name}</strong>,</p>

              <p style="margin:0 0 18px 0;">
                Cảm ơn bạn đã đăng ký tài khoản trên <strong>TechZone</strong>. Vui lòng nhấn nút bên dưới để xác thực địa chỉ email và hoàn tất quá trình đăng ký:
              </p>

              <p style="text-align:center; margin:24px 0;">
                <a href="${verifyUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Xác thực email</a>
              </p>

              <p class="note">
                Lưu ý: Link này có hiệu lực trong <strong>30 phút</strong> kể từ khi gửi. Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này — không có hành động nào khác cần thiết.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 28px 28px 28px;">
              <hr style="border:none; border-top:1px solid #eef1f4; margin:0 0 16px 0;">
              <div class="footer">
                <div style="margin-bottom:6px;">© 2025 TechZone. Mọi quyền được bảo lưu.</div>
                <div>Nếu cần trợ giúp, phản hồi về <a href="mailto:laptop8386@gmail.com">laptop8386@gmail.com</a></div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
    </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  };

// Resend verification email 
export const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  const lastSent = user.sent_at;
  const now = dayjs();
  if (lastSent) {
    const diffMinutes = now.diff(dayjs(lastSent), 'minutes');
    if (diffMinutes < 10) {
      throw new Error(`Bạn chỉ được yêu cầu gửi lại mã xác thực sau ${10 - diffMinutes} phút nữa.`);
    }
  }
  const codeId = uuid4();
  const refreshExpired = dayjs().add(30, 'minutes').toDate();
  await prisma.user.update({
    where: { email: email },
    data: {
      verification_code: codeId,
      sent_at: dayjs().toDate(),
      code_expired: refreshExpired
    },
  });
  await sendVerificationEmail(email, user.name, codeId);
};

// ==================== GỬI EMAIL XÁC THỰC ====================
export const sendPasswordResetEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (!user.isVerified) throw new Error('Tài khoản chưa xác thực email');
    const lastSent = user.sent_at;
    const now = dayjs();
    if (lastSent) {
      const diffMinutes = now.diff(dayjs(lastSent), 'minutes');
      if (diffMinutes < 10) {
        throw new Error(
          `Bạn chỉ được yêu cầu gửi lại mã xác thực sau ${10 - diffMinutes} phút nữa.`,
        );
      }
    }
    const codeId = uuid4();
    const refreshExpired = dayjs().add(30, 'minutes').toDate();
    await prisma.user.update({
        where: { email: email },
        data: {
          verification_code: codeId,
          sent_at: dayjs().toDate(),
          code_expired: refreshExpired
        },
      });
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Xác thực tài khoản TechZone',
      html: `
        <!doctype html>
    <html lang="vi">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Đặt lại mật khẩu</title>
    <style>
  body { margin:0; padding:0; background-color:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
  .header { padding:20px; text-align:center; background:linear-gradient(90deg,#1e90ff,#3fb0ff); color:#fff; }
  .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; }
  .content { padding:28px; color:#333333; line-height:1.5; }
  .btn { display:inline-block; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:600; }
  .btn-primary { background:#1e90ff; color:#ffffff; }
  .note { font-size:13px; color:#666666; margin-top:18px; }
  .footer { padding:18px; font-size:13px; color:#999999; text-align:center; }
  @media (max-width:420px){ .content { padding:18px; } .header{padding:14px} }
</style>
</head>
<body>
<!-- Preheader (hiện tóm tắt trong inbox) -->
<div class="preheader">Đặt lại mật khẩu cho tài khoản của bạn.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:28px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="header">
            <h1 style="margin:0; font-size:20px;">Đặt lại mật khẩu</h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <p style="margin:0 0 12px 0;">Chào <strong>${user.name}</strong>,</p>
            <p style="margin:0 0 18px 0;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên <strong>TechZone</strong>. Vui lòng nhập mã dưới để đặt lại mật khẩu:
            </p>
            <h2
                style="font-size: 20px; font-weight: 700; line-height: 1.25; margin-top: 0; margin-bottom: 15px; text-align: center;">
                ${codeId}</h2>
            <p class="note">
              Lưu ý: Mã này có hiệu lực trong <strong>5 phút</strong> kể từ khi gửi. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này — không có hành động nào khác cần thiết.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
    </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

// ==================== RESET MẬT KHẨU ====================
export const resetPassword = async (email, code, newPassword) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (dayjs().isAfter(dayjs(user.code_expired))) {
      throw new Error('Verification expired. Please resend the code.');
    }
    if (user.verification_code !== code) throw new Error('Invalid code');
    const hashedPassword = await argon.hash(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verification_code: null,
        sent_at: null,
        code_expired: null,
      },
    });
}

// ==================== REGISTER ====================
export const register = async (email, name, password) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email đã được đăng ký!');

    const token = uuid4();
    const hashPassword = await argon.hash(password);
    const code_expired = dayjs().add(30, 'minutes').toDate();

    await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name,
        role: 'USER',
        isVerified: false,
        verification_code: token,
        code_expired,
        sent_at: dayjs().toDate(),
      },
    });

    await sendVerificationEmail(email, name, token);
  }

  // ==================== XÁC THỰC USER ====================
export const validateUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;
    if (!user.isVerified) throw new Error('Tài khoản chưa xác thực email');

    const ok = await argon.verify(user.password, password);
    if (!ok) return null;
    return user;
  }

  // ==================== TẠO TOKEN ====================
export const generateToken = async (user) => {
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRED });
    const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRED });
    return { access_token, refresh_token };
  }

  // ==================== LOGIN ====================
export const login = async (user) => {
    const { access_token, refresh_token } = await generateToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refresh_token },
    });

    return {
      access_token,
      refresh_token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    };
  }

  // ==================== LOGOUT ====================
export const logout = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    await prisma.user.update({ where: { email }, data: { refresh_token: null } });
  }

  // ==================== REFRESH TOKEN ====================
export const postrefresh_token = async (refresh_token) => {
    let payload;
    try {
      payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user || !user.refresh_token){
      throw new Error('User not found or refresh token revoked');
    } 
    const isValid = user.refresh_token === refresh_token;
    
    if (!isValid) {
  throw new Error('Invalid refresh token');
}

    const access_token = jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      },
        process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRED }
    );

    return {
      access_token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    };
  }

  // ==================== XÁC THỰC EMAIL ====================
export const verifyByToken = async (token, email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verification_code !== token)
      throw new Error('Invalid or expired token');

    if (dayjs().isAfter(dayjs(user.code_expired))) {
      await prisma.user.delete({ where: { email } });
      throw new Error('Verification expired. Please register again.');
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verification_code: null, sent_at: null, code_expired: null },
    });
    return 'Email verified'; 
  }
