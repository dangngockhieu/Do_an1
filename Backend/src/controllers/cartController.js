'use strict';
import * as cartService from '../services/cartService.js';

// Thêm sản phẩm vào giỏ hàng
export const addProductToCart = async (req, res) => {
    try {
        const userID = +req.user.id;
        const productID = +req.body.productID;
        await cartService.addProductToCart(userID, productID);
        return res.status(200).json({EM: "Add success", EC: 0});
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

// Lấy số lượng sản phẩm trong giỏ hàng
export const numberCart = async (req, res) => {
    try {
        const userID = +req.user.id;
        const numberCart = await cartService.numberCart(userID);
        return res.status(200).json({ EC: 0, DT: numberCart });
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

// Lấy thông tin giỏ hàng
export const getCart = async (req, res) => {
    try {
        const userID = +req.user.id;
        const carts = await cartService.getCart(userID);
        return res.status(200).json({ EC: 0, DT: carts });
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

// Cập nhật số lượng của sản phẩm trong giỏ hàng
export const updateCartQuantity = async (req, res) => {
    try {
        const newNumber  = +req.body.newNumber;
        const productID = +req.query.productID;
        const userID = +req.user.id; 

        if (!productID || newNumber <= 0) {
            return res.status(400).json({
                EC: -1,
                EM: 'Dữ liệu đầu vào không hợp lệ.',
            });
        }
        const response = await cartService.updateQuantity(userID, productID, newNumber);

        return res.status(200).json({
            EC: response.EC,
            EM: response.EM,
            DT: response.DT, 
        });

    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: 'Lỗi server. Vui lòng thử lại sau.',
        });
    }
};

// Xoá sản phẩm khỏi giỏ hàng
export const deleteCartItem = async (req, res) => {
    try {
        const userID = +req.user.id;
        const productID = +req.query.productID;
        await cartService.deleteCart(userID, productID);
        return res.status(200).json({EM: "Delete success", EC: 0});
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

// Mua ngay sản phẩm
export const buyNow = async (req, res) => {
    try {
        const userID = +req.user.id;
        const productID = +req.query.productID;
        await cartService.buyNow(userID, productID);
        return res.status(200).json({EM: "Add success", EC: 0});
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

// Thanh toán giỏ hàng
export const checkout = async (req, res) => {
    try {
        const userID = +req.user.id;
        const productID = +req.query.productID;
        await cartService.checkout(userID, productID);
        return res.status(200).json({EM: "Checkout success", EC: 0});
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
}