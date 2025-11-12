import prisma from './prisma.js';
import argon from 'argon2';

export const seedDatabase = async () => {
  const existingUser = await prisma.user.findFirst();
  if (! existingUser) {
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

  const ok = await prisma.feature.findFirst();
  if(! ok) {
    await prisma.feature.createMany({
      data: [
        { name: "Văn phòng" },
        { name: "Gaming" },
        { name: "Mỏng nhẹ" },
        { name: "Đồ họa" },
        { name: "Cảm ứng" },
        { name: "Laptop AI" },
        { name: "Điện thoại 5G" },
        { name: "Điện thoại AI"},
        { name: "Gaming Phone"},
        { name: "Phổ thông 4G"},
        { name: "Điện thoại gập"}
      ],
    });
  }
}