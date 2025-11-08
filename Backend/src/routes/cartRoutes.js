'use strict';
import express from 'express';
import { addProductToCart, numberCart, getCart, updateCartQuantity, deleteCartItem, buyNow, checkout
 } from '../controllers/cartController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
const router = express.Router();

const cartRoutes = (app) => {
  router.post('/cart', jwtAuth, addProductToCart);
  router.get('/number-cart', jwtAuth, numberCart);
  router.get('/cart', jwtAuth, getCart);
  router.patch('/cart', jwtAuth, updateCartQuantity);
  router.delete('/cart', jwtAuth, deleteCartItem);

  router.post('/buy-now', jwtAuth, buyNow);
  router.patch('/checkout', jwtAuth, checkout);


  app.use('/cart', router);
};

export default cartRoutes;