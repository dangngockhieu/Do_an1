import express from "express";
import vnpay from "../lib/vnpay.js";
import prisma from "../lib/prisma.js";
import { ProductCode, VnpLocale } from "vnpay";
import dotenv from "dotenv";
dotenv.config();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

const vnpayRoutes = (app) => {

  // Tạo URL thanh toán VNPay
  router.post("/create", async (req, res) => {
    try {
      const { orderID } = req.body;
      if (!orderID) {
        return res.status(400).json({ EC: 1, EM: "Thiếu orderID" });
      }

      const order = await prisma.order.findUnique({
        where: { id: Number(orderID) },
        include: { payment: true },
      });

      if (!order) {
        return res.status(400).json({ EC: 1, EM: "Order không tồn tại" });
      }

      // Xử lý trường hợp payment trả về mảng hoặc object
      let paymentData = order.payment;
      if (Array.isArray(paymentData)) {
          if (paymentData.length === 0) {
             return res.status(400).json({ EC: 1, EM: "Không tìm thấy thông tin thanh toán" });
          }
          paymentData = paymentData[0]; 
      }

      if (!paymentData || !paymentData.amount) {
        return res.status(400).json({ EC: 1, EM: "Dữ liệu payment bị thiếu amount" });
      }

      const amount = Math.round(Number(paymentData.amount));
      
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const createDate = now.format("YYYYMMDDHHmmss");
      const expireDate = now.add(15, "minute").format("YYYYMMDDHHmmss");

      // TxnRef
      const txnRef = `${orderID}_${Date.now().toString().slice(-6)}`;

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: "127.0.0.1", 
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan don hang ${orderID}`, 
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
      });

      return res.status(200).json({
        EC: 0,
        EM: "Tạo URL thanh toán thành công",
        DT: { paymentUrl },
      });
    } catch (err) {
      return res.status(500).json({ EC: 1, EM: "Lỗi tạo thanh toán VNPay" });
    }
  });

  // RETURN URL 
  router.get("/return", async (req, res) => { 
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    try {
      const query = req.query || {};
      const isValid = vnpay.verifyReturnUrl(query);
      if (!isValid) {
        return res.redirect(`${frontendURL}/orders?payment=error&reason=checksum`);
      }

      const code = query.vnp_ResponseCode;
      if (code === "00") {
        const txnRef = query.vnp_TxnRef;
        const orderID = parseInt(txnRef.split("_")[0], 10);

        
        await prisma.payment.update({
            where: { orderID: orderID },
            data: {
                status: "PAID",
                transactionID: query.vnp_TransactionNo || null
            },
        });

        await prisma.order.update({
            where: { id: orderID },
            data: { status: "PENDING" },
        });
        
        console.log("Thanh toán thành công đơn hàng:", orderID);

        return res.redirect(`${frontendURL}/orders?payment=success`);
      }

      // Trường hợp thanh toán thất bại hoặc hủy
      return res.redirect(`${frontendURL}/orders?payment=failed`);
      
    } catch (err) {
      return res.redirect(`${frontendURL}/orders?payment=error`);
    }
});
  app.use("/vnpay", router);
};

export default vnpayRoutes;