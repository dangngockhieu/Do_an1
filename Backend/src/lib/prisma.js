'use strict';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
// Singleton pattern cho Prisma Client để tránh tạo nhiều instances
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

export default prisma;