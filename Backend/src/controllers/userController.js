'use strict';
import * as userService from '../services/userService.js';
// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const data = await userService.getAllUsers();
    return res.status(200).json({ DT: data, EM: 'Get all users successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== GET USERS WITH PAGINATION ====================
export const getUsersWithPaginate = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const search = req.query.search || '';
    const data = await userService.getUserWithPaginate(page, limit, search);
    return res.status(200).json({ DT: data, EM: 'Get users with paginate successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== GET USER BY ID ====================
export const getUserById = async (req, res) => {
  try {
    const id = +req.params.id;
    const user = await userService.getUserById(id);
    return res.status(200).json({ DT: user, EM: 'Get user successful', EC: 0 });
  } catch (error) {    
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const email = req.user?.email;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ EM: 'Missing required fields', EC: -1 });
    }
    await userService.changePassword(email, oldPassword, newPassword);
    return res.status(200).json({ EM: 'Change password successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== FIND USER BY EMAIL ====================
export const findUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const data = await userService.findUserByEmail(email);
    return res.status(200).json({ DT: data, EM: 'Find user successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== ADMIN CREATE USER ====================
export const createUser = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    const user = await userService.postUserForAdmin(email, name, password, role ?? 'USER');
    return res.status(201).json({ DT: user, EM: 'Create user successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== ADMIN UPDATE USER ROLE ====================
export const changeRoleUser = async (req, res) => {
  try {
    const id = +req.params.id;
    const { role } = req.body;
    await userService.changeRoleUser(id, role);
    return res.status(200).json({ EM: 'Change role successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== ADMIN DELETE USER ====================
export const deleteUser = async (req, res) => {
  try {
    const id = +req.params.id;
    await userService.deleteUser(id);
    return res.status(200).json({ EM: 'Delete user successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== COUNT USERS ====================
export const countUsers = async (req, res) => {
  try {
    const count = await userService.countUser();
    return res.status(200).json({ DT: { count }, EM: 'Count users successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};