'use strict';
import express from 'express';
import {
  getAllUsers,
  getUsersWithPaginate,
  findUserPage,
  getUserById,
  changePassword,
  findUserByEmail,
  createUser,
  changeRoleUser,
  deleteUser,
} from '../controllers/userController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

const userRoutes = (app) => {
  router.get('/get-all-users', jwtAuth, authorizeRole(['ADMIN']), getAllUsers);
  router.get('/get-users-paginate', jwtAuth, authorizeRole(['ADMIN']), getUsersWithPaginate);
  router.get('/find-user-page', jwtAuth, authorizeRole(['ADMIN']), findUserPage);
  router.get('/get-user/:id', jwtAuth, authorizeRole(['ADMIN']), getUserById);
  router.patch('/change-password', jwtAuth, changePassword);
  router.get('/find-user', jwtAuth, authorizeRole(['ADMIN']), findUserByEmail);
  router.post('/create-user', jwtAuth, authorizeRole(['ADMIN']), createUser);
  router.patch('/update-role-user/:id', jwtAuth, authorizeRole(['ADMIN']), changeRoleUser);
  router.delete('/delete-user/:id', jwtAuth, authorizeRole(['ADMIN']), deleteUser);

app.use('/user', router);
};

export default userRoutes;
