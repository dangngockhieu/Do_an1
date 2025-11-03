'use strict';
import prisma from '../lib/prisma.js';
import 'dotenv/config'

// Thêm item vào cart
const addItemCart = async (userID, productID, quantity) => {
  try {
    //Kiểm tra sản phẩm có tồn tại và đủ hàng không
    const product = await prisma.product.findFirst({
      where: { id: productID }
    })
    if (!product) {
      return { EC: -1, EM: 'Product not found' };
    }
    // Tìm giỏ hàng của user (Dựa theo UML, mỗi user có 1 cart)
    const cart = await prisma.cart.findFirst({
      where: { userID: userID }
    });
    if (!cart) {
      return { EC: -1, EM: 'Cart not found for user' };
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng (CartItem) chưa
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartID: cart.id,
        productID: productId
      }
    });
    let updateCartItem;

    if (cartItem) {
      if (product.quantity < cartItem.quantity + quantity) {
        return { EC: -1, EM: 'Not enough product quantity in stock' };
      }
      else {
        updateCartItem = await prisma.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity: cartItem.quantity + quantity }
        });
      }
    }
    else {
      if (product.quantity < quantity) {
        return { EC: -1, EM: 'Not enough product quantity in stock' };
      }
      else {
        updateCartItem = await prisma.cartItem.create({
          data: {
            cartID: cart.id,
            productID: productId,
            quantity: quantity
          }
        })
      }
    }

    // Cập nhật lại tổng tiền (total_price) của Cart
    // Coming soon:)))

    return { EC: 0, EM: 'Item added to cart successfully', DT: updatedItem };
  }
  catch (err) {
    return { EC: -1, EM: err.message };
  }
}


export default {
  addItemCart
};