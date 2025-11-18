'use strict';
import express from 'express';
import {
  getAllUsers,
  getUsersWithPaginate,
  getUserById,
  changePassword,
  findUserByEmail,
  createUser,
  changeRoleUser,
  countUsers
} from '../controllers/userController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

const userRoutes = (app) => {
  // Lấy danh sách tất cả người dùng
  router.get('/users', jwtAuth, authorizeRole(['ADMIN']), getAllUsers);
  // Lấy danh sách người dùng có phân trang
  router.get('/users-paginate', jwtAuth, authorizeRole(['ADMIN']), getUsersWithPaginate);
  // Lấy thông tin người dùng theo ID
  router.get('/users/:id', jwtAuth, authorizeRole(['ADMIN']), getUserById);
  // Tìm kiếm người dùng theo email
  router.get('/find-user', jwtAuth, authorizeRole(['ADMIN']), findUserByEmail);
  // Tạo mới người dùng
  router.post('/user', jwtAuth, authorizeRole(['ADMIN']), createUser);
  // Đổi mật khẩu người dùng
  router.patch('/change-password', jwtAuth, changePassword);
  // Thay đổi vai trò người dùng
  router.patch('/user-role/:id', jwtAuth, authorizeRole(['ADMIN']), changeRoleUser);
  // Lấy tổng số người dùng
  router.get('/count', jwtAuth, authorizeRole(['ADMIN']), countUsers);

app.use('/user', router);
};

export default userRoutes;
