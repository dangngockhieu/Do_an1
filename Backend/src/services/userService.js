'use strict';
import prisma from '../lib/prisma.js';
import argon from 'argon2';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";            
import timezone from "dayjs/plugin/timezone.js";   

dayjs.extend(utc);
dayjs.extend(timezone);

// CHECK EMAIL EXIST 
export const isEmailExist = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
};

// GET USERS WITH PAGINATION 
export const getUserWithPaginate = async (page = 1, limit = 10, search = '') => {
  page = +page || 1;
  limit = +limit || 10;
  const offset = (page - 1) * limit;

  const searchCondition = search ? `${search}%` : null;

  let users = [];
  let totalResult = [];

  if (searchCondition) {
    users = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, role 
       FROM users 
       WHERE isVerified = true 
       AND email LIKE ? 
       ORDER BY id ASC 
       LIMIT ? OFFSET ?;`,
      searchCondition,
      limit,
      offset
    );

    totalResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total 
       FROM users 
       WHERE isVerified = true 
       AND email LIKE ?;`,
      searchCondition
    );
  } else {
    users = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, role 
       FROM users 
       WHERE isVerified = true 
       ORDER BY id ASC 
       LIMIT ? OFFSET ?;`,
      limit,
      offset
    );

    totalResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total 
       FROM users 
       WHERE isVerified = true;`
    );
  }

  //  Chuyển BigInt → Number 
  const safeUsers = users.map((u) =>
    Object.fromEntries(
      Object.entries(u).map(([k, v]) => [
        k,
        typeof v === 'bigint' ? Number(v) : v,
      ])
    )
  );

  const total =
    totalResult?.[0]?.total && typeof totalResult[0].total === 'bigint'
      ? Number(totalResult[0].total)
      : totalResult?.[0]?.total || 0;

  return { users: safeUsers, total };
};

// FIND USER BY EMAIL 
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

// CREATE USER (ADMIN) 
export const postUserForAdmin = async (email, name, password, role) => {
  const existingUser = await isEmailExist(email);
  if (existingUser) throw new Error('Email đã được đăng ký!');

  const hashPassword = await argon.hash(password);
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashPassword,
      isVerified: true,
      role,
    },
  });
};

// CHANGE PASSWORD
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

// CHANGE ROLE USER 
export const changeRoleUser = async (id, role) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User không tồn tại!');

  await prisma.user.update({
    where: { id },
    data: { role },
  });
};

// Count User
export const countUser = async () => {
  const count = await prisma.user.count({
    where: { isVerified: true },
  });
  return count;
};

// Count Users This Month
export const countUsersThisMonth = async () => {
  const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();

  const startOfMonth = dayjs(vnNow).startOf('month').toDate();
  const endOfMonth = dayjs(vnNow).endOf('month').toDate();
  const count = await prisma.user.count({
    where: {
      sent_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      isVerified: true
    },
  });

  return count;
};


