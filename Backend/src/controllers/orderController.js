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
            EM: "Lỗi tạo đơn hàng"
        });
    }
};

export const getOrderPendingforAdmin = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const orders = await orderService.getOrderPendingforAdmin(page, limit);
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh sách đơn hàng thành công",
            DT: orders
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi lấy danh sách đơn hàng"
        });
    }
};

export const getOrderShippingforAdmin = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const orders = await orderService.getOrderShippingforAdmin(page, limit);
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh sách đơn hàng thành công",
            DT: orders
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

export const updatePendingtoShipping = async (req, res) => {
    try {
        const orderID = Number(req.query.orderID);
        const { trackingCode, receivedDate } = req.body;
        const updatedOrder = await orderService.updatePendingtoShipping(orderID, trackingCode, receivedDate);
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

export const updateOrderComplete = async (req, res) => {
    try {
        const orderID = +req.query.orderID;
        const updatedOrder = await orderService.updateOrderComplete(orderID);
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
    const count = await orderService.countOrders();
    return res.status(200).json({ DT: { count }, EM: 'Count orders successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

// ==================== Revenue ====================
export const getRevenueThisMonth = async (req, res) => {
  try {
    const revenue = await orderService.getRevenueThisMonth();
    return res.status(200).json({ DT: { revenue }, EM: 'Get revenue successful', EC: 0 });
  } catch (error) {
    return res.status(500).json({ EM: error.message || 'Server Internal Error', EC: -1 });
  }
};

export const getRevenueByMonth = async (req, res) => {
  try {
    const data = await orderService.getRevenueByMonth();
    res.status(200).json({ EC: 0, EM: "OK", DT: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ EC: -1, EM: "Server error" });
  }
};
