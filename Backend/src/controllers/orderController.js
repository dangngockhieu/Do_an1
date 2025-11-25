'use strict';
import * as orderService from '../services/orderService.js';

export const createOrder = async (req, res) => {
    try {
        const userID = +req.user.id;
        const { recipientName, address, phone, items, totalPrice, paymentMethod } = req.body;
        const newOrder = await orderService.createOrder(userID, recipientName, address, phone, 
            items, totalPrice, paymentMethod
        );

        return res.status(200).json({
            EC: 0,
            EM: "Tạo đơn hàng thành công!",
            DT: newOrder
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: error.message ||"Lỗi tạo đơn hàng"
        });
    }
};

export const getOrderPendingforAdmin = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const {orders, pg} = await orderService.getOrderPendingforAdmin(page, limit);
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh sách đơn hàng thành công",
            DT: {orders, pg}
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi lấy danh sách đơn hàng"
        });
    }
};

export const getOrderforAdmin = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const status = req.query.status || 'SHIPPING';
        const {orders, pg} = await orderService.getOrderforAdmin(page, limit, status);
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh sách đơn hàng thành công",
            DT: {orders, pg}
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi lấy danh sách đơn hàng"
        });
    }
};

export const getOrderItem = async (req, res) => {
    try {
        const orderID = +req.query.orderID;
        const orderItems = await orderService.getOrderItem(orderID);
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh sách sản phẩm trong đơn hàng thành công",
            DT: orderItems
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi lấy danh sách sản phẩm trong đơn hàng"
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userID = +req.user.id;
        const status = req.query.status;
        const orders = await orderService.getUserOrders(userID, status);
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh sách đơn hàng thành công",
            DT: orders
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: error.message || "Lỗi lấy danh sách đơn hàng"
        });
    }
};

export const updatePendingtoShipping = async (req, res) => {
    try {
        const orderID = Number(req.query.orderID);
        const { trackingCode, expectedDate } = req.body;
        const updatedOrder = await orderService.updatePendingtoShipping(orderID, trackingCode, expectedDate);
        return res.status(200).json({
            EC: 0,
            EM: "Cập nhật đơn hàng thành công!",
            DT: updatedOrder
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi cập nhật đơn hàng"
        });
    }
};

export const updateOrderforUser = async (req, res) => {
    try {
        const orderID = +req.query.orderID;
        const userID = +req.user.id;
        const status = req.body.status;
        const updatedOrder = await orderService.updateOrderforUser(orderID, userID, status);
        return res.status(200).json({
            EC: 0,
            EM: "Cập nhật đơn hàng thành công!",
            DT: updatedOrder
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi cập nhật đơn hàng"
        });
    }
};

// ==================== COUNT ORDERS ====================
export const countOrders = async (req, res) => {
  try {
    const {count, countPending, countShipping, countCompleted} = await orderService.countOrders();
    return res.status(200).json({ DT: {count, countPending, countShipping, countCompleted}, 
                    EM: 'Count orders successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== Revenue ====================
export const getRevenueThisMonth = async (req, res) => {
  try {
    const {currentMonthRevenue, growth} = await orderService.getRevenueThisMonth();
    return res.status(200).json({ DT: {currentMonthRevenue, growth}, EM: 'Get revenue successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

export const getRevenueByMonth = async (req, res) => {
  try {
    const data = await orderService.getRevenueByMonth();
    res.status(200).json({ EC: 0, EM: "Success", DT: data });
  } catch (e) {
    res.status(500).json({ EC: -1, EM: "Server error" });
  }
};

export const buyAgain = async (req, res) => {
  try {
    const userID = +req.user.id;
    const { products } = req.body;
    await orderService.buyAgain(userID, products);
    return res.status(200).json({   
        EC: 0,
        EM: "Thêm sản phẩm từ đơn hàng cũ vào giỏ hàng thành công"
    });
  } catch (error) {
    return res.status(500).json({   
        EC: 1,
        EM: error.message || "Lỗi thêm sản phẩm vào giỏ hàng"
    });
  }
};