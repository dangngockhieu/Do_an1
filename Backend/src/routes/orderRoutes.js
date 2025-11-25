'use strict';
import express from 'express';
import { createOrder, getOrderPendingforAdmin, getOrderforAdmin, getOrderItem, getUserOrders, buyAgain,
  updateOrderforUser, updatePendingtoShipping, countOrders, getRevenueThisMonth, getRevenueByMonth
 } from '../controllers/orderController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
const router = express.Router();

const orderRoutes = (app) => {

  // Tạo đơn hàng
  router.post('/order', jwtAuth, createOrder);

  // Lấy danh sách đơn hàng đang chờ xử lý
  router.get('/orders/pending', jwtAuth, authorizeRole(['ADMIN']), getOrderPendingforAdmin);

  // Lấy danh sách đơn hàng đang vận chuyển
  router.get('/orders', jwtAuth, authorizeRole(['ADMIN']), getOrderforAdmin);

  // Lấy chi tiết đơn hàng
  router.get('/orders-item', jwtAuth, authorizeRole(['ADMIN']), getOrderItem);

  // Cập nhật trạng thái đơn hàng sang quá trình vận chuyển 
  router.patch('/order-to-shipping', jwtAuth, authorizeRole(['ADMIN']), updatePendingtoShipping);

  // Cập nhật trạng thái đơn hàng sang quá trình hoàn thành
  router.patch('/order', jwtAuth, updateOrderforUser);

  // Lấy danh sách đơn hàng của người dùng
  router.get('/my-orders', jwtAuth, getUserOrders);

  // Thống kê số lượng đơn hàng trong tháng
  router.get('/count', jwtAuth, authorizeRole(['ADMIN']), countOrders);

  // Thống kê doanh thu trong tháng hiện tại
  router.get('/revenue-this-month', jwtAuth, authorizeRole(['ADMIN']), getRevenueThisMonth);

  // Thống kê doanh thu theo tháng
  router.get('/revenue-by-month', jwtAuth, authorizeRole(['ADMIN']), getRevenueByMonth);

  // Thêm sản phẩm từ đơn hàng cũ vào giỏ hàng
  router.post('/buy-again', jwtAuth, buyAgain);

  app.use('/order', router);
};

export default orderRoutes;