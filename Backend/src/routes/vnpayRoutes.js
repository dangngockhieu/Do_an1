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
  const parseOrderId = (txnRef) => {
    if (!txnRef || typeof txnRef !== "string") return null;
    const id = parseInt(txnRef.split("_")[0], 10);
    if (isNaN(id)) return null;
    return id;
  };

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

      const payment = order.payment;
      if (!payment || !payment.amount) {
        return res.status(400).json({ EC: 1, EM: "Không tìm thấy payment.amount" });
      }

      const amount = Math.round(Number(payment.amount));
      const now = dayjs().tz("Asia/Ho_Chi_Minh");

      const createDate = now.format("YYYYMMDDHHmmss");
      const expireDate = now.add(15, "minute").format("YYYYMMDDHHmmss");

      // TxnRef an toàn và <20 ký tự
      const txnRef = `${orderID}_${Date.now().toString().slice(-6)}`;

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: req.ip || "127.0.0.1",
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toán đơn hàng #${orderID}`,
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
  router.get("/return", (req, res) => {
    try {
      const query = req.query || {};
      const frontendURL = process.env.FRONTEND_URL;

      const isValid = vnpay.verifyReturnUrl(query);

      if (!isValid) {
        return res.redirect(`${frontendURL}/orders?payment=error`);
      }

      const code = query.vnp_ResponseCode;

      if (code === "00") {
        return res.redirect(`${frontendURL}/orders?payment=success`);
      }

      return res.redirect(`${frontendURL}/orders?payment=failed`);
    } catch (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=error`);
    }
  });

  // IPN (XỬ LÝ THANH TOÁN THẬT)
  router.all("/ipn", async (req, res) => {
    try {
      // VNPay có thể gửi GET hoặc POST
      const query = Object.keys(req.query).length ? req.query : req.body;

      //  Check checksum
      const isValid = vnpay.verifyReturnUrl(query);
      if (!isValid) {
        return res.status(200).json({ RspCode: "97", Message: "Invalid checksum" });
      }

      // Parse OrderID
      const orderID = parseOrderId(query.vnp_TxnRef);
      if (!orderID) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      // Lấy payment record
      const payment = await prisma.payment.findFirst({ where: { orderID } });
      if (!payment) {
        return res.status(200).json({ RspCode: "01", Message: "Payment not found" });
      }

      const responseCode = query.vnp_ResponseCode;

      // Idempotent 
      if (payment.status === "PAID") {
        return res.status(200).json({ RspCode: "00", Message: "Order already confirmed" });
      }

      // Kiểm tra amount
      const amountFromVnp = Number(query.vnp_Amount);
      const amountDB = Number(payment.amount);

      // VNPay gửi amount * 100
      if (amountFromVnp !== amountDB) {
        console.warn("Amount mismatch:", amountFromVnp, amountDB);
        return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
      }

      // Thành công
      if (responseCode === "00") {
        await prisma.payment.updateMany({
          where: { orderID },
          data: {
            status: "PAID",
            transactionID: query.vnp_TransactionNo || null,
            paymentDate: dayjs().tz("Asia/Ho_Chi_Minh"),
          },
        });

        await prisma.order.update({
          where: { id: orderID },
          data: { status: "PENDING" },
        });

        console.log("IPN: Payment confirmed for order:", orderID);
        return res.status(200).json({ RspCode: "00", Message: "Confirm success" });
      }
      return res.status(200).json({ RspCode: "00", Message: "Payment failed" });

    } catch (err) {
      return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  });

  app.use("/vnpay", router);
};

export default vnpayRoutes;
