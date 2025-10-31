// prisma/seed.js
import prisma from './prisma.js';
import argon from 'argon2';

export const seedDatabase = async () => {
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log(' Database already seeded — skipping');
    return;
  }

  // Hash mật khẩu mặc định bằng argon2
  const passwordHash = await argon.hash('123456');

  // Seed dữ liệu mẫu
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
