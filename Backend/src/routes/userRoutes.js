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
  deleteUser,
  countUsers
} from '../controllers/userController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

const userRoutes = (app) => {
  router.get('/users', jwtAuth, authorizeRole(['ADMIN']), getAllUsers);
  router.get('/users-paginate', jwtAuth, authorizeRole(['ADMIN']), getUsersWithPaginate);
  ////////////////////////////////////////////////////////
  router.get('/users/:id', jwtAuth, authorizeRole(['ADMIN']), getUserById);
  router.get('/find-user', jwtAuth, authorizeRole(['ADMIN']), findUserByEmail);
  ///////////////////////////////////////////////////////
  router.post('/user', jwtAuth, authorizeRole(['ADMIN']), createUser);
  router.patch('/change-password', jwtAuth, changePassword);
  router.patch('/user-role/:id', jwtAuth, authorizeRole(['ADMIN']), changeRoleUser);
  router.delete('/users/:id', jwtAuth, authorizeRole(['ADMIN']), deleteUser);

  // ==================== COUNT USERS ====================
  router.get('/count', jwtAuth, authorizeRole(['ADMIN']), countUsers);

app.use('/user', router);
};

export default userRoutes;
