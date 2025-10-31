'use strict';
import prisma from '../lib/prisma.js';
import argon from 'argon2';

// ==================== CHECK EMAIL EXIST ====================
export const isEmailExist = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
};

// ==================== GET ALL USERS ====================
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: { isVerified: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });
  return users;
};

// ==================== GET USERS WITH PAGINATION ====================
export const getUserWithPaginate = async (page = 1, limit = 10, search = '') => {
  page = +page || 1;
  limit = +limit || 10;
  const offset = (page - 1) * limit;

  const whereCondition = {
    isVerified: true, 
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      skip: offset,
      take: limit,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return { users, total };
};

// ==================== FIND PAGE OF USER (BY SEARCH) ====================
export const findUserPage = async (search, limit = 10) => {
  if (!search) return -1;

  let user = null;
  if (search.includes('@')) {
    user = await prisma.user.findUnique({ where: { email: search } });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { name: { contains: search }, isVerified: true },
      orderBy: { id: 'asc' },
    });
  }

  if (!user) return -1;

  const countBefore = await prisma.user.count({ where: { id: { lt: user.id }, isVerified: true } });
  const page = Math.floor(countBefore / (+limit || 10)) + 1;
  return page;
};

// ==================== GET USER BY ID ====================
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: id, isVerified: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });
  return user || null;
};

// ==================== FIND USER BY EMAIL ====================
export const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
    }
 });
  return user;
};

// ==================== CREATE USER (ADMIN) ====================
export const postUserForAdmin = async (name, email, password, role) => {
  const existingUser = await isEmailExist(email);
  if (existingUser) throw new Error('Email đã được đăng ký!');

  const hashPassword = await argon.hash(password);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      isVerified: true,
      role,
    },
  });
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (email, oldPassword, newPassword) => {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) throw new Error('User không tồn tại!');

  if (user.password && !(await argon.verify(user.password, oldPassword))) {
    throw new Error('Old password is incorrect');
  }

  const hashPassword = await argon.hash(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword },
  });
};

// ==================== CHANGE ROLE USER ====================
export const changeRoleUser = async (id, role) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User không tồn tại!');

  await prisma.user.update({
    where: { id },
    data: { role },
  });
};

// ==================== DELETE USER ====================
export const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User không tồn tại!');

  await prisma.user.delete({ where: { id } });
};
