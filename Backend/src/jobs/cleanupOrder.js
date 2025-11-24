import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const cleanupUnpaidOrders = async () => {
  try {
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const threshold = nowVN.subtract(24, 'hour').toDate();
    // Lấy các order chưa thanh toán quá 24h và không phải COD
    const ordersToDelete = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        orderDate: { lt: threshold },
        payment: {
          method: { not: 'COD' },
          status: 'UNPAID',
        },
      },
      include: {
        orderItems: true,
        payment: true,
      },
    });

    await prisma.$transaction(
      ordersToDelete.map(order => 
        prisma.$executeRaw`
          -- Cộng lại quantity cho sản phẩm
          UPDATE products p
          JOIN order_items oi ON p.id = oi.productID
          SET p.quantity = p.quantity + oi.quantity
          WHERE oi.orderID = ${order.id};
          -- Xóa orderItems
          DELETE FROM order_items WHERE orderID = ${order.id};
          -- Xóa payment
          DELETE FROM payments WHERE orderID = ${order.id};
          -- Xóa order
          DELETE FROM orders WHERE id = ${order.id};
        `
      )
    );
  } catch (err) {
    console.error('Cleanup unpaid orders failed:', err);
  }
};

// Chạy cron 0h mỗi ngày
cron.schedule('0 0 * * *', cleanupUnpaidOrders, {
  timezone: 'Asia/Ho_Chi_Minh',
});

export default cleanupUnpaidOrders;
