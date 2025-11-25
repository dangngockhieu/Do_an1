'use strict';
import prisma from '../lib/prisma.js';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";            
import timezone from "dayjs/plugin/timezone.js"; 
dayjs.extend(utc);
dayjs.extend(timezone);
// ===================== Tạo đơn hàng =====================
export const createOrder = async (userID, recipientName, address, phone, items, totalPrice, paymentMethod) => {
    const nowVN = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
    return await prisma.$transaction(async (prismaTx) => {
      // Kiểm tra tồn kho cho từng sản phẩm
      for (const item of items) {
        const product = await prismaTx.product.findUnique({
          where: { id: +item.productID },
        });
        if (!product) throw new Error(`Sản phẩm ID ${item.productID} không tồn tại`);
        if (product.quantity < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.quantity} trong kho`);
        }
      }

      // Tạo đơn hàng
      const orderItemsData = items.map(item => ({
        productID: +item.productID,
        quantity: +item.quantity,
        price: +item.price,
      }));

      const newOrder = await prismaTx.order.create({
        data: {
          userID,
          recipientName,
          address,
          phone,
          totalPrice: +totalPrice,
          status: 'PENDING',
          orderDate: nowVN,
          payment: {
            create: {
              amount: +totalPrice,
              method: paymentMethod,
              status: 'UNPAID',
              createdAt: nowVN,
            },
          },
          orderItems: {
            createMany: { data: orderItemsData },
          },
        },
        include: { payment: true, orderItems: true }
      });

      //  Cập nhật số lượng tồn kho
      await prismaTx.$executeRaw`
        UPDATE products p
        JOIN order_items oi ON p.id = oi.productID
          SET p.quantity = p.quantity - oi.quantity
        WHERE oi.orderID = ${newOrder.id};
      `;

      return newOrder;
    });
};

// =================== Lấy danh sách đơn hàng đang chờ xử lý cho admin ===================
export const getOrderPendingforAdmin = async (page = 1, limit = 10) => {
  page = +page || 1;
  limit = +limit || 10;
  const offset = (page - 1) * limit;

  const totalResult = await prisma.$queryRaw`
    SELECT COUNT(*) AS total
    FROM orders o
    LEFT JOIN payments p ON o.id = p.orderID
    WHERE 
      o.status = 'PENDING'
      AND (
        p.status = 'PAID'
        OR (p.status = 'UNPAID' AND p.method = 'COD')
      );
  `;
  const totalRecords = Number(totalResult[0]?.total || 0);
  const totalPages = Math.ceil(totalRecords / limit);

  const orders = await prisma.$queryRaw`
    SELECT 
        o.id AS orderID, 
        o.userID, 
        o.recipientName, 
        o.address, 
        o.phone, 
        o.status AS orderStatus,   
        o.totalPrice, 
        o.orderDate, 
        p.method AS paymentMethod, 
        p.status AS paymentStatus,
        (SELECT u.email FROM users u WHERE u.id = o.userID) AS userEmail
    FROM 
        orders o
    LEFT JOIN 
        payments p ON o.id = p.orderID
    WHERE 
        o.status = 'PENDING'
        AND (
            p.status = 'PAID' 
            OR 
            (p.status = 'UNPAID' AND p.method = 'COD')
        )
    ORDER BY 
        o.orderDate DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  return {
    orders,
    pg: {
      totalRecords,
      totalPages,
      currentPage: page,
    },
  };
};

// =========================== Lấy danh sách đơn hàng cho admin theo trạng thái ==========================
export const getOrderforAdmin = async (page = 1, limit = 10, status) => {
  page = +page || 1;
  limit = +limit || 10;
  const offset = (page - 1) * limit;

  const totalResult = await prisma.$queryRaw`
    SELECT COUNT(*) AS total
    FROM orders o
    LEFT JOIN payments p ON o.id = p.orderID
    WHERE o.status = ${status};
  `;
  const totalRecords = Number(totalResult[0]?.total || 0);
  const totalPages = Math.ceil(totalRecords / limit);

  const orders = await prisma.$queryRaw`
    SELECT 
        o.id AS orderID, 
        o.userID, 
        o.recipientName, 
        o.address, 
        o.phone, 
        o.status AS orderStatus,   
        o.totalPrice, 
        o.trackingCode, 
        o.deliveryDate,
        o.expectedDate,
        o.receivedDate,
        o.orderDate, 
        p.method AS paymentMethod, 
        p.status AS paymentStatus,
        (SELECT u.email FROM users u WHERE u.id = o.userID) AS userEmail
    FROM 
        orders o
    LEFT JOIN 
        payments p ON o.id = p.orderID
    WHERE 
        o.status = ${status}
    ORDER BY 
        o.orderDate DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  return {
    orders,
    pg: {
      totalRecords,
      totalPages,
      currentPage: page,
    },
  };
};

//  ========================== Cập nhật trạng thái đơn hàng sang quá trình vận chuyển ==========================
export const updatePendingtoShipping = async(orderID, trackingCode, expectedDate) =>{
    const nowVN = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
    const expectedVN = expectedDate ? dayjs(expectedDate).tz("Asia/Ho_Chi_Minh").toDate() : null;

    const updatedOrder = await prisma.order.update({
        where: { id: +orderID },
        data: {
            status: 'SHIPPING',
            trackingCode: trackingCode,
            deliveryDate: nowVN,
            expectedDate: expectedVN,
        },
    });

    return updatedOrder;
};

// =========================== Cập nhật trạng thái đơn hàng cho user khi nhận hàng ==========================
export const updateOrderforUser = async(orderID, userID, status) =>{  

    const updatedOrder = await prisma.order.update({
        where: { id: +orderID, userID: +userID },
        data: {
            status: `${status}`,
        },
    });
    await prisma.$executeRaw`
        UPDATE products p
        JOIN order_items oi ON p.id = oi.productID
        SET 
          p.sold = p.sold + oi.quantity
        WHERE oi.orderID = ${orderID};
    `;

    return updatedOrder;
};

// =========================== Lấy chi tiết đơn hàng ==========================
export const getOrderItem = async(orderID) =>{
    const products = await prisma.$queryRaw`
    SELECT 
        p.id AS productID,          
        p.name,                     
        oi.quantity,                
        oi.price AS unitPrice,      
        (
          SELECT pi.url
          FROM product_images pi
          WHERE pi.productID = p.id
          ORDER BY pi.id ASC
          LIMIT 1
        ) AS imageUrl
    FROM 
        order_items oi
    INNER JOIN 
        products p ON oi.productID = p.id
    WHERE 
        oi.orderID = ${orderID};
    `;
    return products;
};

// =========================== Lấy danh sách đơn hàng của người dùng ==========================
export const getUserOrders = async (userID, status) => {
  const rows = await prisma.$queryRaw`
    SELECT 
      o.id AS orderID,
      o.totalPrice,
      o.status,
      o.orderDate,
      pm.method AS paymentMethod,
      pm.status AS paymentStatus,
      p.id AS productID,
      p.name AS productName,
      oi.id AS orderItemID,
      oi.quantity,
      oi.price AS unitPrice,
      oi.isReviewed,
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.productID = p.id
        ORDER BY pi.id ASC
        LIMIT 1
      ) AS imageUrl
    FROM orders o
    JOIN payments pm ON pm.orderID = o.id
    JOIN order_items oi ON oi.orderID = o.id
    JOIN products p ON p.id = oi.productID

    WHERE o.userID = ${userID}
    AND o.status = ${status}

    ORDER BY o.orderDate DESC;
  `;

  const orders = {};

  for (const row of rows) {
    const id = row.orderID;

    if (!orders[id]) {
      orders[id] = {
        orderID: row.orderID,
        totalPrice: row.totalPrice,
        status: row.status,
        orderDate: row.orderDate,
        paymentMethod: row.paymentMethod,
        paymentStatus: row.paymentStatus,
        products: []   
      };
    }

    orders[id].products.push({
      productID: row.productID,
      name: row.productName,
      orderItemID: row.orderItemID,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      isReviewed: row.isReviewed,
      imageUrl: row.imageUrl
    });
  }

  return Object.values(orders);
};

// =========================== Thống kê số lượng đơn hàng trong tháng ==========================
export const countOrders = async () => {
  const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();

  const startOfMonth = dayjs(vnNow).startOf('month').toDate();
  const endOfMonth = dayjs(vnNow).endOf('month').toDate();
  const count = await prisma.order.count({
    where: {
      orderDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: { not: 'CANCELLED' },
    },
  });

  const countPending = await prisma.order.count({
    where: {
      orderDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'PENDING',
    },
  });

  const countShipping = await prisma.order.count({
    where: {
      orderDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'SHIPPING',
    },
  });

  const countCompleted = await prisma.order.count({
    where: {
      orderDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'COMPLETED',
    },
  });

  return {count, countPending, countShipping, countCompleted};
};

// ====================== Thống kê doanh thu trong tháng hiện tại =======================
export const getRevenueThisMonth = async () => {
  const vnNow = dayjs().tz("Asia/Ho_Chi_Minh");

  const startOfCurrentMonth = vnNow.startOf('month').toDate();
  const endOfCurrentMonth = vnNow.endOf('month').toDate();

  const startOfPrevMonth = vnNow.subtract(1, 'month').startOf('month').toDate();
  const endOfPrevMonth = vnNow.subtract(1, 'month').endOf('month').toDate();

  const currentMonthResult = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: {
      status: "COMPLETED",
      orderDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
    },
  });
  const currentMonthRevenue = currentMonthResult._sum.totalPrice || 0;

  const prevMonthResult = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: {
      status: "COMPLETED",
      orderDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
    },
  });
  const prevMonthRevenue = prevMonthResult._sum.totalPrice || 0;

  let growth = 0;
  if (prevMonthRevenue > 0) {
    growth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
  } else if (currentMonthRevenue > 0) {
    growth = 100;
  }

  return {
    currentMonthRevenue,
    growth: Number(growth.toFixed(2)), 
  };
};

// ================== Thống kê doanh thu theo tháng ===================
export const getRevenueByMonth = async () => {
  const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
  const year = dayjs(vnNow).year();

  const startOfYear = dayjs().tz("Asia/Ho_Chi_Minh").year(year).startOf('year').toDate();
  const endOfYear = dayjs().tz("Asia/Ho_Chi_Minh").year(year).endOf('year').toDate();

  const result = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      orderDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      orderDate: true,
      totalPrice: true,
    },
  });

  const monthlyRevenue = Array(12).fill(0);
  result.forEach((r) => {
    const vnDate = dayjs(r.orderDate).tz("Asia/Ho_Chi_Minh");
    const month = vnDate.month(); 
    monthlyRevenue[month] += r.totalPrice;
  });

  return monthlyRevenue;
};

export const buyAgain = async (userID, products) => {
    for (const p of products) {
        const product = await prisma.product.findFirst({
            where: { id: p.productID, quantity: { gt: 0 } }
        });
        if (!product) {                 
            continue; 
        }

        const existingCart = await prisma.cart.findFirst({
            where: { userID: userID, productID : p.productID },
        });

        if (existingCart) {
            await prisma.cart.update({
            where: { userID_productID: { userID: userID, productID : p.productID } },
            data: { isSelected: true },
        });
        } else {
            await prisma.cart.create({
                data: { userID: userID, productID : p.productID, number: 1, isSelected: true },
            });
        }
    }
};




