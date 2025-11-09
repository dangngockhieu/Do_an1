'use strict';
import express from 'express';
import { createOrder, getOrderPendingforAdmin, getOrderShippingforAdmin, getOrderItem,
  updateOrderComplete, updatePendingtoShipping
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


  app.use('/order', router);
};

export default orderRoutes;