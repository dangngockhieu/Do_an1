'use strict';
import express from 'express';
import { createOrder, getOrderPendingforAdmin, getOrderShippingforAdmin, getOrderItem,
  updateOrderComplete, updatePendingtoShipping, countOrders, getRevenueThisMonth, getRevenueByMonth
 } from '../controllers/orderController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
const router = express.Router();

const orderRoutes = (app) => {
  router.post('/order', jwtAuth, createOrder);
  router.get('/orders/pending', jwtAuth, authorizeRole(['ADMIN']), getOrderPendingforAdmin);
  router.get('/orders/shipping', jwtAuth, authorizeRole(['ADMIN']), getOrderShippingforAdmin);
  router.get('/orders-item', jwtAuth, authorizeRole(['ADMIN']), getOrderItem);
  router.patch('/order-to-shipping', jwtAuth, authorizeRole(['ADMIN']), updatePendingtoShipping);
  router.patch('/order-complete', jwtAuth, updateOrderComplete);

  // ==================== COUNT ORDERS ====================
  router.get('/count', jwtAuth, authorizeRole(['ADMIN']), countOrders);
  router.get('/revenue-this-month', jwtAuth, authorizeRole(['ADMIN']), getRevenueThisMonth);

  router.get('/revenue-by-month', jwtAuth, authorizeRole(['ADMIN']), getRevenueByMonth);



  app.use('/order', router);
};

export default orderRoutes;