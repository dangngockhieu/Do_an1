'use strict';
import express from 'express';
import { addProductToCart, numberCart, getCart, updateCartQuantity, deleteCartItem, buyNow, checkout
 } from '../controllers/cartController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
const router = express.Router();

const cartRoutes = (app) => {
  // Thêm sản phẩm vào giỏ hàng
  router.post('/cart', jwtAuth, addProductToCart);
  // Lấy số lượng sản phẩm trong giỏ hàng
  router.get('/number-cart', jwtAuth, numberCart);
  // Lấy giỏ hàng của người dùng
  router.get('/cart', jwtAuth, getCart);
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  router.patch('/cart', jwtAuth, updateCartQuantity);
  // Xóa sản phẩm khỏi giỏ hàng
  router.delete('/cart', jwtAuth, deleteCartItem);
  // Chưa có trong giỏ hàng thì thêm vào, tích chọn ngay
  router.post('/buy-now', jwtAuth, buyNow);
  // Thanh toán giỏ hàng
  router.patch('/checkout', jwtAuth, checkout);

  app.use('/cart', router);
};

export default cartRoutes;