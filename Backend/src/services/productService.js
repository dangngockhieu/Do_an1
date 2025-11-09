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
    ) AS images ,
    (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT('id', f.id, 'name', f.name)
        )
        FROM product_features pf
        JOIN features f ON pf.featureID = f.id
        WHERE pf.productID = p.id
    ) AS features
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
      p.id, p.name, p.coupon, p.price, p.originalPrice,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT JSON_ARRAYAGG(pi.url)
        FROM product_images pi 
        WHERE pi.productId = p.id 
      ) AS imageUrls
    FROM products p
    LEFT JOIN reviews r ON p.id = r.productID
    WHERE p.category = 'LAPTOP' AND p.quantity > 0
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
      p.id, p.name, p.coupon, p.price, p.originalPrice,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT JSON_ARRAYAGG(pi.url)
        FROM product_images pi 
        WHERE pi.productId = p.id
      ) AS imageUrls
    FROM products p
    LEFT JOIN reviews r ON p.id = r.productID
    WHERE p.category = 'PHONE' AND p.quantity > 0
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


export const getAllProducts = async (category, filters) => {
  const whereClauses = [`p.category = '${category}'`];

  // --- Thương hiệu (factory) ---
  if (filters?.factories?.length) {
    const brandNames = filters.factories.map(b => `'${b}'`).join(", ");
    whereClauses.push(`p.factory IN (${brandNames})`);
  }

  // --- Nhu cầu ---
  if (filters?.product_features?.length) {
  const featureIds = filters.product_features.join(", ");
  whereClauses.push(`
    EXISTS (
      SELECT 1 FROM product_features pf
      WHERE pf.productID = p.id AND pf.featureID IN (${featureIds})
    )
  `);
}

  // --- Khoảng giá ---
 if (filters?.price) {
  const { min, max } = filters.price;

  if (min != null && max != null) {
    whereClauses.push(`p.price BETWEEN ${min} AND ${max}`);
  } else if (min != null) {
    whereClauses.push(`p.price >= ${min}`);
  } else if (max != null) {
    whereClauses.push(`p.price <= ${max}`);
  }
}

 // ======= Lọc SPECIFIC =======
if (filters?.specs) {
  const specs = filters.specs;

  // === Lọc CPU ===
  if (specs.CPU?.length && !specs.CPU.includes("Tất cả")) {
    const cpuVals = specs.CPU
    .filter(v => v && v !== "Tất cả") 
    .map(v =>
      `REPLACE(LOWER(p.cpu), ' ', '') LIKE CONCAT('%', '${v.toLowerCase().replace(/\s/g, '')}', '%')`
    ).join(" OR ");
    if (cpuVals) whereClauses.push(`(${cpuVals})`);
  }

  // === Lọc RAM ===
  if (specs.RAM?.length && !specs.RAM.includes("Tất cả")) {
    const ramVals = specs.RAM
    .filter(v => v && v !== "Tất cả") 
    .map(v =>
      `REPLACE(LOWER(p.ram), ' ', '') LIKE CONCAT('%', '${v.toLowerCase().replace(/\s/g, '')}', '%')`
    ).join(" OR ");
    if (ramVals) whereClauses.push(`(${ramVals})`);
  }


  // === Lọc Cạc đồ họa rời ===
  if (specs.GPU?.length && !specs.GPU.includes("Tất cả")) {
    const gpuVals = specs.GPU
    .filter(v => v && v !== "Tất cả") 
    .map(v =>
      `REPLACE(LOWER(p.graphicsCard), ' ', '') LIKE CONCAT('%', '${v.toLowerCase().replace(/\s/g, '')}', '%')`
    )
    .join(" OR ");
    if (gpuVals) whereClauses.push(`(${gpuVals})`);
}

  // === Lọc Ổ cứng ===
  if (specs.Storage?.length && !specs.Storage.includes("Tất cả")) {
    const ssdVals = specs.Storage
    .filter(v => v && v !== "Tất cả") 
    .map(v =>
      `REPLACE(LOWER(p.storage), ' ', '') LIKE CONCAT('%', '${v.toLowerCase().replace(/\s/g, '')}', '%')`
    )
    .join(" OR ");
    if (ssdVals) whereClauses.push(`(${ssdVals})`);
}

  // === Lọc kích thước màn hình ===
  if (specs.ScreenSize?.length && !specs.ScreenSize.includes("Tất cả")) {
    const screenVals = specs.ScreenSize
    .filter(v => v && v !== "Tất cả") 
    .map(v =>
      `REPLACE(LOWER(p.screen), ' ', '') LIKE CONCAT('%', '${v.toLowerCase().replace(/\s/g, '')}', '%')`
    )
    .join(" OR ");
    if (screenVals) whereClauses.push(`(${screenVals})`);
  }

  // === Lọc Pin (nếu là điện thoại) ===
  if (specs.PIN?.length && !specs.PIN.includes("Tất cả")) {
  const pinConditions = specs.PIN
    .filter(v => v && v !== "Tất cả")
    .map(v => {
      // lấy phần số (vd: "3000" → 3000)
      const num = parseInt(v.match(/\d+/)?.[0] || 0, 10);
      const min = num;
      const max = num + 1000; 
      return `CAST(REGEXP_SUBSTR(p.battery, '[0-9]+') AS UNSIGNED) >= ${min} AND CAST(REGEXP_SUBSTR(p.battery, '[0-9]+') AS UNSIGNED) < ${max}`;
    })
    .join(" OR ");

  if (pinConditions) whereClauses.push(`(${pinConditions})`);
}

  // === Lọc Màn hình (nếu là điện thoại) ===
  if (specs.Screen?.length && !specs.Screen.includes("Tất cả")) {
    const displayVals = specs.Screen
    .filter(v => v && v !== "Tất cả") 
    .map(v =>
      `REPLACE(LOWER(p.screen), ' ', '') LIKE CONCAT('%', '${v.toLowerCase().replace(/\s/g, '')}', '%')`
    )
    .join(" OR ");
    if (displayVals) whereClauses.push(`(${displayVals})`);
}
}


  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const products = await prisma.$queryRawUnsafe(`
    SELECT 
      p.id, p.name, p.coupon, p.price, p.originalPrice, p.factory,
      ROUND(AVG(r.rating), 2) AS avgRating,
      COUNT(r.id) AS totalReviews,
      (
        SELECT JSON_ARRAYAGG(pi.url)
        FROM product_images pi 
        WHERE pi.productId = p.id
      ) AS imageUrls
    FROM products p
    LEFT JOIN reviews r ON p.id = r.productID
    ${whereSQL}
    GROUP BY p.id
    ORDER BY p.sold DESC
  `);

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



export const getProductById = async (id) => {
  const result = await prisma.$queryRaw`
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
    WHERE p.id = ${id}
    GROUP BY p.id;
  `;

  if (!result || result.length === 0) return { product: null, reviews: [] };

  let product = result[0];

  for (let key in product) {
    if (typeof product[key] === "bigint") {
      product[key] = Number(product[key]);
    }
  }

  if (typeof product.imageUrls === "string") {
    try {
      product.imageUrls = JSON.parse(product.imageUrls);
    } catch {
      product.imageUrls = [];
    }
  }

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

  return {product, reviews};
}


// Add đặc điểm cho sản phẩm
export const addProductFeatures = async (productID, featureIDs) => {
  if (!Array.isArray(featureIDs) || featureIDs.length === 0) {
        throw new Error("featureIDs must be a non-empty array.");
    }
    // Tạo mảng dữ liệu (Data Array)
    const dataToCreate = featureIDs.map(featureID => ({
        productID: productID,
        featureID: featureID,
    }));

    // Sử dụng createMany với mảng data
    await prisma.productFeature.createMany({
        data: dataToCreate,
        skipDuplicates: true, 
    });
};

// Xóa đặc điểm sản phẩm
export const deleteProductFeature = async (productID, featureID) => {
  await prisma.productFeature.delete({
    where: {
      productID_featureID: {
        productID,
        featureID,
      },
    },
  });
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
      productID: product.id,
    }));
    await prisma.productImage.createMany({ data: imagesData });
  }

  return product;
};

// Cập nhật thông tin sản phẩm
export const updateProduct = async (id, data) => {
  // Ép kiểu cho các trường số
  if ('originalPrice' in data)
    data.originalPrice = +data.originalPrice;
  if ('quantity' in data)
    data.quantity = +data.quantity;
  if ('coupon' in data)
    data.coupon = +data.coupon;
  if ('releaseYear' in data)
    data.releaseYear = data.releaseYear.toString();

  const basePrice = data.originalPrice ;
  const couponValue = data.coupon ?? 0;

  // Tính lại giá mới
  const finalPrice = basePrice - (basePrice * couponValue) / 100;
  const roundedPrice = Math.floor(finalPrice / 10000) * 10000;

  return prisma.product.update({
    where: { id: +id },
    data: { ...data, price: roundedPrice },
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

    await prisma.productFeature.deleteMany({ where: { productID: id } });
    await prisma.product.delete({ where: { id } });

    return { EC: 0, EM: "Xóa sản phẩm thành công" };
  } catch (error) {
    return { EC: 1, EM: "Xóa sản phẩm thất bại", DT: error.message };
  }
};


// ==================== Count Products ====================
export const countProducts = async () => {
  const count = await prisma.product.count();
  return count;
}