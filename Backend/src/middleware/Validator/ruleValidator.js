import { checkSchema } from 'express-validator';

export const registerValidator = checkSchema({
  email: {
    notEmpty: { errorMessage: 'Email không được để trống' },
    isEmail: { errorMessage: 'Email sai định dạng' },
    normalizeEmail: true
  },
  name: {
    notEmpty: { errorMessage: 'Tên không được để trống' },
    escape: true
  },
  password: {
    notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
    isLength: { options: { min: 6, max: 255 }, errorMessage: 'Mật khẩu phải từ 6 ký tự' }
  }
});

export const loginValidator = checkSchema({
  email: {
    notEmpty: { errorMessage: 'Email không được để trống' },
    isEmail: { errorMessage: 'Email sai định dạng' },
    normalizeEmail: true
  },
  password: {
    notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
    isLength: { options: { min: 6, max: 255 }, errorMessage: 'Mật khẩu phải từ 6 ký tự' }
  }
});

export const resetPasswordValidator = checkSchema({
  email: {
    notEmpty: { errorMessage: 'Email không được để trống' },
    isEmail: { errorMessage: 'Email sai định dạng' },
    normalizeEmail: true
  },
  code: {
    notEmpty: { errorMessage: 'Mã xác nhận không được thiếu' },
    escape: true
  },
  newPassword: {
    notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
    isLength: { options: { min: 6, max: 255 }, errorMessage: 'Mật khẩu phải từ 6 ký tự' }
  }
});

export const changePasswordValidator = checkSchema({
  oldPassword: {
    notEmpty: { errorMessage: 'Mật khẩu cũ không được để trống' }
  },
  newPassword: {
    notEmpty: { errorMessage: 'Mật khẩu mới không được để trống' },
    isLength: { options: { min: 6, max: 255 }, errorMessage: 'Mật khẩu phải từ 6 ký tự' }
  }
});

export const createReviewValidator = checkSchema({
  comment: {
    optional: true,
    escape: true
  }
});

export const createOrderValidator = checkSchema({
  recipientName: {
    notEmpty: { errorMessage: 'Tên không được để trống' },
    escape: true
  },
  address: {
    notEmpty: { errorMessage: 'Địa chỉ không được để trống' },
    escape: true
  },
  phone: {
    notEmpty: { errorMessage: 'Số điện thoại không được để trống' },
    isMobilePhone: { options: 'vi-VN', errorMessage: 'Số điện thoại không hợp lệ' }
  }
});