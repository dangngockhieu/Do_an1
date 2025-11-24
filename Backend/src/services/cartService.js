'use strict';
import prisma from '../lib/prisma.js';

// ================ Thêm item vào cart =================
export const addProductToCart = async (userID, productID) => {
  const product = await prisma.product.findFirst({
    where: { id: productID, quantity: { gt: 0 } }
  });

  if (!product) {
    throw new Error('Product not found or out of stock');
  }

  const existingCart = await prisma.cart.findFirst({
    where: { userID, productID },
  });

  if (existingCart) {
    await prisma.cart.update({
      where: { userID_productID: { userID, productID } },
      data: { number: { increment: 1 } },
    });
  } else {
    await prisma.cart.create({
      data: { userID, productID, number: 1 },
    });
  }
};

// ================ Đếm số item trong cart =================
export const numberCart = async (userID) =>{
  if (!userID) throw new Error("userID is missing");

  const carts = await prisma.$queryRaw`
    SELECT COUNT(productID) AS numberCart
    FROM carts
    WHERE userID = ${userID};
  `;

  const count = carts?.[0]?.numberCart ?? 0;
  return Number(count);
};

// ================ Lấy thông tin giỏ hàng =================
export const getCart = async (userID) => {
  const cartItems = await prisma.$queryRaw`
    SELECT p.id, p.name, p.price, p.quantity, p.originalPrice, c.number, c.isSelected,
    (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.productId = p.id
        ORDER BY pi.id ASC
        LIMIT 1
      ) AS imageUrl
    FROM products p
    INNER JOIN carts c ON p.id = c.productID
    WHERE c.userID = ${userID}
  `;
  return cartItems;
};

// ================ Update số lượng sản phẩm trong giỏ hàng =================
export const updateQuantity = async (userID, productID, newNumber) => {
  if (newNumber <= 0) {
    return { 
      EC: -6, 
      EM: 'Số lượng phải lớn hơn 0.' 
    };
  }

  const product = await prisma.product.findUnique({ 
    where: { id: productID },
    select: {
      quantity: true, 
      name: true
    } 
  });
  if (!product) {
    return { EC: -2, EM: 'Sản phẩm không tồn tại.' };
  }
        
  if (newNumber > product.quantity) {
    return { 
      EC: -3, 
      EM: `Số lượng yêu cầu (${newNumber}) vượt quá số lượng tồn kho (${product.quantity}) của ${product.name}.`,
      DT: { 
        productID: productID,
        confirmedNumber: product.quantity 
      } 
    };
  }
  await prisma.cart.updateMany({ 
    where: {
      userID: userID,
      productID: productID
    },
    data: {
      number: newNumber 
    }
  });

  return {
    EC: 0,
    EM: 'Cập nhật giỏ hàng thành công.',
    DT: { 
      productID: productID, 
      confirmedNumber: newNumber 
    }
};
};

// ================ Xoá sản phẩm khỏi giỏ hàng =================
export const deleteCart = async (userID, productID) => {
  await prisma.cart.deleteMany({
    where: { userID, productID },
  });
}

// ================ Mua ngay sản phẩm =================
export const buyNow = async (userID, productID) => {
  const product = await prisma.product.findFirst({
    where: { id: productID, quantity: { gt: 0 } }
  });

  if (!product) {
    throw new Error('Product not found or out of stock');
  }

  const existingCart = await prisma.cart.findFirst({
    where: { userID, productID },
  });

  if (existingCart) {
    await prisma.cart.update({
      where: { userID_productID: { userID, productID } },
      data: { isSelected: true },
    });
  } else {
    await prisma.cart.create({
      data: { userID, productID, number: 1, isSelected: true },
    });
  }
};

// ================ Thanh toán sản phẩm =================
export const checkout = async (userID, productID) => {
  await prisma.cart.updateMany({
    where: { userID, productID },
    data: { isSelected: false },
  });
};
