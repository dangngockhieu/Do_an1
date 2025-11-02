import prisma from './prisma.js';
import argon from 'argon2';

export const seedDatabase = async () => {
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    return;
  }

  const passwordHash = await argon.hash('123456');

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: passwordHash,
        role: 'ADMIN',
        isVerified: true,
      },
      {
        name: 'User',
        email: 'user@gmail.com',
        password: passwordHash,
        role: 'USER',
        isVerified: true,
      },
    ],
  });
}