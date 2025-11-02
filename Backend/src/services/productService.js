'use strict';
import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

// Lấy tất cả sản phẩm có phân trang
export const getProductsWithPaginate = async (page, limit, search, category) => {
  const skip = (page - 1) * limit;

  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { infor: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const normalizedCategory = typeof category === 'string' && category.trim() ? category.trim() : null;
  if (normalizedCategory) {
    filters.push({ category: normalizedCategory });
  }

  const where = filters.length ? { AND: filters } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
      include: { images: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
};

// Lấy 1 sản phẩm
export const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
};

// Tạo sản phẩm mới
export const createProduct = async (data, files) => {
  let finalPrice = +data.originalPrice;
  const couponValue = +data.coupon;
  let roundedPrice = 0;
  if (couponValue > 0) {
    finalPrice = +data.originalPrice - (+data.originalPrice * couponValue / 100);
    roundedPrice = Math.floor(finalPrice / 10000) * 10000;
  }

  
  const product = await prisma.product.create({
    data: {
      ...data,
      sold: 0,
      price: roundedPrice,
      originalPrice: +data.originalPrice,
      quantity: +data.quantity,
      coupon: +data.coupon || 0,
      releaseYear: data.releaseYear?.toString() || "",
    },
  });

  // Nếu có file upload, multer đã lưu file vào public/uploads/products/
  if (files?.length) {
    const imagesData = files.map((f) => ({
      url: `/uploads/products/${f.filename}`,
      productId: product.id,
    }));
    await prisma.productImage.createMany({ data: imagesData });
  }

  return product;
};

// Cập nhật thông tin sản phẩm
export const updateProduct = async (id, data) => {
  return prisma.product.update({ where: { id }, data });
};

// Thêm nhiều ảnh (khi edit muốn thêm ảnh mới)
export const addProductImages = async (productId, files) => {
  if (!files?.length) return;
  const imagesData = files.map((f) => ({
    url: `/uploads/products/${f.filename}`,
    productId,
  }));
  await prisma.productImage.createMany({ data: imagesData });
};

// Cập nhật 1 ảnh
export const updateProductImage = async (imageId, file) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error('Image not found');

  const oldPath = path.join('public', image.url);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

  return prisma.productImage.update({
    where: { id: imageId },
    data: { url: `/uploads/products/${file.filename}` },
  });
};

// Xóa 1 ảnh
export const deleteProductImage = async (imageId) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error('Image not found');

  const filePath = path.join('public', image.url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.productImage.delete({ where: { id: imageId } });
};

// Xóa sản phẩm + ảnh
export const deleteProduct = async (id) => {
  try {
    // Lấy toàn bộ ảnh của sản phẩm
    const images = await prisma.productImage.findMany({ where: { productId: id } });

    // Xoá từng file ảnh thật trong thư mục
    for (const img of images) {
      const relativePath = img.url.startsWith('/')
        ? img.url.slice(1)
        : img.url;

      const filePath = path.join('public', relativePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          console.warn(`Error deleting file ${filePath}:`, err.message);
        }
      }
    }

    // Xoá record ảnh và sản phẩm trong DB
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return { EC: 0, EM: "Xóa sản phẩm thành công" };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { EC: 1, EM: "Xóa sản phẩm thất bại", DT: error.message };
  }
};
