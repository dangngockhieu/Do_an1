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
// Lấy 5 sp Laptop bán chạy nhất
export const getTopSellingLaptop = async () => {
  const products = await prisma.$queryRaw`
    SELECT 
      p.id, p.name, p.originalPrice, p.price, p.coupon, p.sold,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT pi.url 
        FROM product_images pi 
        WHERE pi.productId = p.id 
        ORDER BY pi.id ASC 
        LIMIT 1
      ) AS imageUrl
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

  return safeProducts;
}

// Lấy 5 sp Phone bán chạy nhất
export const getTopSellingPhone = async () => {
  const products = await prisma.$queryRaw`
    SELECT 
      p.id, p.name, p.originalPrice, p.price, p.coupon, p.sold,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT pi.url 
        FROM product_images pi 
        WHERE pi.productId = p.id 
        ORDER BY pi.id ASC 
        LIMIT 1
      ) AS imageUrl
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

  return safeProducts;
}

// Lấy 1 sản phẩm
export const getProductById = async (id) => {
  const [product] = await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.originalPrice,
      p.price,
      p.coupon,
      p.sold,
      p.quantity,
      p.warranty,
      p.infor,
      p.cpu,
      p.ram,
      p.storage,
      p.screen,
      p.graphicsCard,
      p.battery,
      p.weight,
      p.releaseYear,
      p.category,
      p.factory,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT JSON_ARRAYAGG(pi.url)
        FROM product_images pi
        WHERE pi.productId = p.id
      ) AS imageUrls,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', rv.id,
            'rating', rv.rating,
            'comment', rv.comment,
            'createdAt', rv.createdAt,
            'userName', u.name
          )
        )
        FROM reviews rv
        JOIN users u ON rv.userID = u.id
        WHERE rv.productID = p.id
      ) AS reviews
    FROM products p
    LEFT JOIN reviews r ON p.id = r.productID
    WHERE p.id = ${id}
    GROUP BY p.id;
  `;

  return product;
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
