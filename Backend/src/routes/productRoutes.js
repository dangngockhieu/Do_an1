'use strict';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getProductsWithPaginate,
  getProductById,
  createProduct,
  updateProduct,
  addProductImages,
  updateProductImage,
  deleteProductImage,
  deleteProduct,
} from '../controllers/productController.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// ==================== MULTER CONFIG ====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join('public', 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// ==================== ROUTES ====================
const productRoutes = (app) => {
  // Lấy danh sách sản phẩm (có phân trang, search)
  router.get('/get-products-paginate', getProductsWithPaginate);

  // Lấy chi tiết sản phẩm theo ID
  router.get('/get-product/:id', getProductById);

  // Tạo mới sản phẩm (có ảnh)
  router.post(
    '/create-product',
    jwtAuth,
    authorizeRole(['ADMIN']),
    upload.array('images', 10),
    createProduct
  );

  // Cập nhật thông tin sản phẩm (không ảnh)
  router.patch(
    '/update-product/:id',
    jwtAuth,
    authorizeRole(['ADMIN']),
    updateProduct
  );

  // Thêm nhiều ảnh cho sản phẩm
  router.post(
    '/add-product-images/:id',
    jwtAuth,
    authorizeRole(['ADMIN']),
    upload.array('images', 10),
    addProductImages
  );

  // Cập nhật 1 ảnh cụ thể
  router.patch(
    '/update-product-image/:imageId',
    jwtAuth,
    authorizeRole(['ADMIN']),
    upload.single('image'),
    updateProductImage
  );

  // Xóa 1 ảnh
  router.delete(
    '/delete-product-image/:imageId',
    jwtAuth,
    authorizeRole(['ADMIN']),
    deleteProductImage
  );

  // Xóa sản phẩm
  router.delete(
    '/delete-product/:id',
    jwtAuth,
    authorizeRole(['ADMIN']),
    deleteProduct
  );

  app.use('/product', router);
};

export default productRoutes;
