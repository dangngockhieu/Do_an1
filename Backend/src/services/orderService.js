'use strict';
import prisma from '../lib/prisma.js';

export const createOrder = async (userID, recipientName, address, phone, items, totalPrice, paymentMethod) => {
    const orderItemsData = items.map(item => ({
        productID: +item.productID, 
        quantity: +item.quantity,
        price: +item.price,
    }));
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const newOrder = await prisma.order.create({
        data: {
            userID: userID,
            recipientName: recipientName,
            address: address,
            phone: phone,
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
                createMany: {
                    data: orderItemsData,
                },
            },
        },
        include: {
            payment: true,
            orderItems: true,
        }
    });

    return newOrder;
};
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
        p.status AS paymentStatus
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
    pagination: {
      totalRecords,
      totalPages,
      currentPage: page,
    },
  };
};

export const getOrderShippingforAdmin = async (page = 1, limit = 10) => {
  page = +page || 1;
  limit = +limit || 10;
  const offset = (page - 1) * limit;

  const totalResult = await prisma.$queryRaw`
    SELECT COUNT(*) AS total
    FROM orders o
    LEFT JOIN payments p ON o.id = p.orderID
    WHERE o.status = 'SHIPPING';
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
        o.receivedDate,
        o.orderDate, 
        p.method AS paymentMethod, 
        p.status AS paymentStatus
    FROM 
        orders o
    LEFT JOIN 
        payments p ON o.id = p.orderID
    WHERE 
        o.status = 'SHIPPING'
    ORDER BY 
        o.orderDate DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  return {
    orders,
    pagination: {
      totalRecords,
      totalPages,
      currentPage: page,
    },
  };
};

export const updatePendingtoShipping = async(orderID, trackingCode, receivedDate) =>{
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const updatedOrder = await prisma.order.update({
        where: { id: +orderID },
        data: {
            status: 'SHIPPING',
            trackingCode: trackingCode,
            deliveryDate: nowVN,
            receivedDate: receivedDate ? new Date(new Date(receivedDate).getTime() + 7 * 60 * 60 * 1000) : null,
        },
    });

    return updatedOrder;
};

export const updateOrderComplete = async(orderID) =>{
    const updatedOrder = await prisma.order.update({
        where: { id: +orderID },
        data: {
            status: 'COMPLETED',
        },
    });

    return updatedOrder;
};

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