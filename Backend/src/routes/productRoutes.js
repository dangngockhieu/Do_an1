'use strict';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getProductsWithPaginate,
  getTopSellingLaptop,
  getTopSellingPhone,
  addProductFeatures,
  deleteProductFeature,
  getProductById,
  createProduct,
  updateProduct,
  addProductImages,
  deleteProductImage,
  deleteProduct,
  getFilteredProducts,
  countProducts
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
  router.get('/products-paginate', getProductsWithPaginate);
  // Lấy chi tiết đánh giá sản phẩm theo ID
  router.get('/products/:id', getProductById);
  // Lấy 5 sp Laptop bán chạy nhất
  router.get('/top-selling-laptop', getTopSellingLaptop);
  // Lấy 5 sp Phone bán chạy nhất
  router.get('/top-selling-phone', getTopSellingPhone);
  // Lọc sp
  router.post("/filter-products", getFilteredProducts);
  // Thêm nhiều đặc điểm cho sản phẩm
  router.post(
    '/product-features/:productID', jwtAuth, authorizeRole(['ADMIN']), addProductFeatures
  );
  // delete đặc điểm của sản phẩm
  router.delete(
    '/product-feature', jwtAuth, authorizeRole(['ADMIN']), deleteProductFeature
  );
  // Tạo mới sản phẩm (có ảnh)
  router.post(
    '/product', jwtAuth, authorizeRole(['ADMIN']), upload.array('images', 10), createProduct
  );
  // Cập nhật thông tin sản phẩm (không ảnh)
  router.put(
    '/products/:id', jwtAuth, authorizeRole(['ADMIN']), updateProduct
  );
  // Thêm nhiều ảnh cho sản phẩm
  router.post(
    '/product-images/:id', jwtAuth, authorizeRole(['ADMIN']), upload.array('images', 10), addProductImages
  );
  // Xóa 1 ảnh
  router.delete(
    '/product-image/:imageId', jwtAuth, authorizeRole(['ADMIN']), deleteProductImage
  );
  // Xóa sản phẩm
  router.delete(
    '/products/:id', jwtAuth, authorizeRole(['ADMIN']), deleteProduct
  );
  // Lấy tổng số sản phẩm
  router.get('/count', jwtAuth, authorizeRole(['ADMIN']), countProducts);

  app.use('/product', router);
};

export default productRoutes;
