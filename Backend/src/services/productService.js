'use strict';
import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

// Lấy tất cả sản phẩm có phân trang
export const getProductsWithPaginate = async (page = 1, limit = 10, search = "", category, factory) => {
  page = +page || 1;
  limit = +limit || 10;
  const offset = (page - 1) * limit;

  // Tạo điều kiện WHERE động
  let whereClauses = [`1=1`];

  if (category && ["LAPTOP", "PHONE"].includes(category)) {
    whereClauses.push(`p.category = '${category}'`);
  }

  if (factory && factory !== "ALL") {
    whereClauses.push(`p.factory = '${factory}'`);
  }

  if (search && search.trim() !== "") {
    const keyword = `%${search.trim()}%`;
    whereClauses.push(`(p.name LIKE ${prisma.raw("'" + keyword + "'")} OR p.infor LIKE ${prisma.raw("'" + keyword + "'")})`);
  }

  const whereSQL = whereClauses.join(" AND ");

  //  Lấy danh sách sản phẩm
  const products = await prisma.$queryRawUnsafe(`
    SELECT p.*, 
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', i.id, 'url', i.url)
        )
        FROM product_images i
        WHERE i.productId = p.id
    ) AS images
    FROM products p
    LEFT JOIN product_images i ON i.productId = p.id
    WHERE ${whereSQL}
    GROUP BY p.id
    ORDER BY p.id ASC
    LIMIT ${limit} OFFSET ${offset};
  `);

  //  Đếm tổng
  const totalResult = await prisma.$queryRawUnsafe(`
    SELECT COUNT(DISTINCT p.id) AS total
    FROM products p
    WHERE ${whereSQL};
  `);

  // Convert BigInt
  const safeProducts = products.map((p) =>
    Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]))
  );
  const total =
    totalResult?.[0]?.total && typeof totalResult[0].total === "bigint"
      ? Number(totalResult[0].total)
      : totalResult?.[0]?.total || 0;

  return { products: safeProducts, total };
};
// Lấy 5 sp Laptop bán chạy nhất
export const getTopSellingLaptop = async () => {
  const products = await prisma.$queryRaw`
    SELECT 
      p.*,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT JSON_ARRAYAGG(pi.url)
        FROM product_images pi 
        WHERE pi.productId = p.id
      ) AS imageUrls
    FROM products p
    LEFT JOIN reviews r ON p.id = r.productID
    WHERE p.category = 'LAPTOP'
    GROUP BY p.id
    ORDER BY p.sold DESC
    LIMIT 5;
  `;

  const safeProducts = products.map(p =>
    Object.fromEntries(
      Object.entries(p).map(([k, v]) => [
        k,
        typeof v === 'bigint' ? Number(v) : v
      ])
    )
  );

  safeProducts.forEach(p => {
    if (typeof p.imageUrls === 'string') {
      try {
        p.imageUrls = JSON.parse(p.imageUrls);
      } catch {
        p.imageUrls = [];
      }
    }
  });

  return safeProducts;
};

// Lấy 5 sp Phone bán chạy nhất
export const getTopSellingPhone = async () => {
  const products = await prisma.$queryRaw`
    SELECT 
      p.*,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT JSON_ARRAYAGG(pi.url)
        FROM product_images pi 
        WHERE pi.productId = p.id
      ) AS imageUrls
    FROM products p
    LEFT JOIN reviews r ON p.id = r.productID
    WHERE p.category = 'PHONE'
    GROUP BY p.id
    ORDER BY p.sold DESC
    LIMIT 5;
  `;

  const safeProducts = products.map(p =>
    Object.fromEntries(
      Object.entries(p).map(([k, v]) => [
        k,
        typeof v === 'bigint' ? Number(v) : v
      ])
    )
  );

  safeProducts.forEach(p => {
    if (typeof p.imageUrls === 'string') {
      try {
        p.imageUrls = JSON.parse(p.imageUrls);
      } catch {
        p.imageUrls = [];
      }
    }
  });

  return safeProducts;
}

// Lấy 1 sản phẩm
export const getReviewsByProductId = async (id) => {
  const reviews = await prisma.$queryRaw`
    SELECT 
      r.id,
      r.rating,
      r.comment,
      u.name AS userName,
      r.createdAt
    FROM reviews r
    INNER JOIN users u ON r.userID = u.id
    WHERE r.productID = ${id}
    ORDER BY r.createdAt DESC;
  `;

  return reviews;
};

// Tạo sản phẩm mới
export const createProduct = async (data, files) => {
  let finalPrice = +data.originalPrice;
  const couponValue = +data.coupon;
  let roundedPrice = +data.originalPrice;
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
  // Lọc bỏ undefined hoặc null
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
  );
  // Ép kiểu cho các trường số
  if ('originalPrice' in cleanedData)
    cleanedData.originalPrice = +cleanedData.originalPrice;
  if ('quantity' in cleanedData)
    cleanedData.quantity = +cleanedData.quantity;
  if ('coupon' in cleanedData)
    cleanedData.coupon = +cleanedData.coupon;
  if ('releaseYear' in cleanedData)
    cleanedData.releaseYear = cleanedData.releaseYear.toString();

  // Nếu ko có thay đổi coupon và originalPrice 
  if (!('coupon' in cleanedData || 'originalPrice' in cleanedData)) {
    return prisma.product.update({
    where: { id: +id },
    data: cleanedData,
  });
  }
  // Nếu có thay đổi coupon và originalPrice 
  if ('coupon' in cleanedData && 'originalPrice' in cleanedData) {
    let final = cleanedData.originalPrice - (cleanedData.originalPrice * cleanedData.coupon) / 100;
    let price = Math.floor(final / 10000) * 10000;
    return prisma.product.update({
      where: { id: +id },
      data: { ...cleanedData, price: price },
  });
  }
    // Lấy thông tin hiện tại trong DB (phòng khi không gửi lên)
    const product = await prisma.product.findUnique({
      where: { id: +id },
      select: { originalPrice: true, coupon: true },
    });
    if (!product) throw new Error("Product not found");
    // Lấy giá trị gốc và giảm giá hợp lệ
    const basePrice = cleanedData.originalPrice ?? product.originalPrice;
    const couponValue = cleanedData.coupon ?? product.coupon ?? 0;

    // Tính lại giá mới
    const finalPrice = basePrice - (basePrice * couponValue) / 100;
    const roundedPrice = Math.floor(finalPrice / 10000) * 10000;

  return prisma.product.update({
    where: { id: +id },
    data: { ...cleanedData, price: roundedPrice },
  });
};


// Thêm nhiều ảnh (khi edit muốn thêm ảnh mới)
export const addProductImages = async (productID, files) => {
  if (!files?.length) return;
  const imagesData = files.map((f) => ({
    url: `/uploads/products/${f.filename}`,
    productID,
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
    const images = await prisma.productImage.findMany({ where: { productID: id } });

    // Xoá từng file ảnh thật trong thư mục
    for (const img of images) {
      const relativePath = img.url.startsWith('/')
        ? img.url.slice(1)
        : img.url;

      const filePath = path.join('public', relativePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`Error deleting file ${filePath}:`, err.message);
        }
      }
    }

    // Xoá record ảnh và sản phẩm trong DB
    await prisma.productImage.deleteMany({ where: { productID: id } });
    await prisma.product.delete({ where: { id } });

    return { EC: 0, EM: "Xóa sản phẩm thành công" };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { EC: 1, EM: "Xóa sản phẩm thất bại", DT: error.message };
  }
};
