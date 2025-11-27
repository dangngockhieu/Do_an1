'use strict';
import express from 'express';
import {
  getUsersWithPaginate,
  changePassword,
  findUserByEmail,
  createUser,
  changeRoleUser,
  countUsers,
  countUsersThisMonth
} from '../controllers/userController.js';
import { jwtAuth } from '../middleware/Auth/jwtAuth.js';
import { authorizeRole } from '../middleware/Auth/authorizeRole.js';
import { changePasswordValidator } from '../middleware/Validator/ruleValidator.js';
import { validate } from '../middleware/Validator/validatorInput.js';

const router = express.Router();

const userRoutes = (app) => {

  // Lấy danh sách người dùng có phân trang
  router.get('/users-paginate', jwtAuth, authorizeRole(['ADMIN']), getUsersWithPaginate);

  // Tìm kiếm người dùng theo email
  router.get('/find-user', jwtAuth, authorizeRole(['ADMIN']), findUserByEmail);

  // Tạo mới người dùng
  router.post('/user', jwtAuth, authorizeRole(['ADMIN']), createUser);

  // Đổi mật khẩu người dùng
  router.patch('/change-password', jwtAuth, changePasswordValidator, validate, changePassword);

  // Thay đổi vai trò người dùng
  router.patch('/user-role/:id', jwtAuth, authorizeRole(['ADMIN']), changeRoleUser);

  // Lấy tổng số người dùng
  router.get('/count', jwtAuth, authorizeRole(['ADMIN']), countUsers);
  
  // Lấy tổng số người dùng mới trong tháng hiện tại
  router.get('/count-this-month', jwtAuth, authorizeRole(['ADMIN']), countUsersThisMonth);

app.use('/user', router);
};

export default userRoutes;
