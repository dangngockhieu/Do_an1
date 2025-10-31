import cron from 'node-cron';
import prisma from '../lib/prisma.js';

const cleanupExpiredUsers = async () => {
  try {
    const now = new Date();
    const result = await prisma.user.deleteMany({
      where: {
        isVerified: false,
        refresh_expired: { lt: now.toISOString() },
      },
    });
    if (result.count > 0) {
      console.log(`[CLEANUP] Deleted ${result.count} expired users`);
    }
  } catch (err) {
    console.error('Cleanup job failed:', err);
  }
};

// Chạy 0h mỗi ngày
cron.schedule('0 0 * * *', cleanupExpiredUsers, {
  timezone: 'Asia/Ho_Chi_Minh',
});

export default cleanupExpiredUsers;
