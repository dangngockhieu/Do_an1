import express from "express";
import vnpay from "../lib/vnpay.js";
import prisma from "../lib/prisma.js";
import { ProductCode, VnpLocale } from "vnpay"; 
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

const vnpayRoutes = (app) => {
    router.post("/create", async (req, res) => {
        try {
            const { orderID } = req.body;
            if (!orderID) {
                return res.status(400).json({ EC: 1, EM: "orderID thiếu" });
            }
            const order = await prisma.order.findUnique({
                where: { id: +orderID },
                include: { payment: true }
            });

            if (!order) {
                return res.status(400).json({ EC: 1, EM: "Order không tồn tại" });
            }
            const payment = order.payment;

            if (!payment || !payment.amount) {
                return res.status(400).json({
                    EC: 1,
                    EM: "Không tìm thấy payment.amount"
                });
            }
            // IP
            const ipAddr = "127.0.0.1";
            const amount = Math.round(Number(payment.amount));
            console.log("AMOUNT SEND TO VNP:", amount);
            //  Thời gian
            const now = dayjs().tz("Asia/Ho_Chi_Minh");
            const createDate = now.format("YYYYMMDDHHmmss");
            const expireDate = now.add(15, "minute").format("YYYYMMDDHHmmss");
            //  Order Info
            const orderInfo = `Thanh toan don hang ${orderID}`;
            //  Tạo TxnRef CHUẨN (<20 ký tự, chỉ số)
            const txnRef = `${orderID}${now.format("HHmmss")}`; 
            //  Build VNPay URL
            const paymentUrl = vnpay.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_IpAddr: ipAddr,
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: createDate,
                vnp_ExpireDate: expireDate,
            });

            return res.status(200).json({
                EC: 0,
                EM: "Tạo URL thanh toán VNPay thành công",
                DT: { paymentUrl }
            });

        } catch (err) {
            return res.status(500).json({ EC: 1, EM: "Lỗi tạo thanh toán VNPay" });
        }
    });

    // ==============================
    //  XỬ LÝ TRẢ VỀ
    // ==============================
    router.get("/return", async (req, res) => {
        try {
            const query = req.query;
            const isValid = vnpay.verifyReturnUrl(query);

            if (!isValid) {
                return res.redirect('http://localhost:3000/orders?payment=error');
            }

            const orderID = parseInt(query.vnp_OrderInfo.split(" ").pop());

            if (!orderID) {
                 return res.redirect('http://localhost:3000/orders?payment=error');
            }

            if (query.vnp_ResponseCode === "00") {
                await prisma.payment.updateMany({
                    where: { orderID: orderID },
                    data: {
                        status: "PAID",
                        transactionID: query.vnp_TransactionNo, 
                        paymentDate: dayjs().tz("Asia/Ho_Chi_Minh") 
                    }
                });
                await prisma.order.update({
                    where: { id: orderID },
                    data: { status: "PENDING" } 
                });

                return res.redirect('http://localhost:3000/orders?payment=success');

            } else {
                console.log(` Giao dịch thất bại/Hủy đơn #${orderID}`);

                return res.redirect('http://localhost:3000/orders?payment=failed');
            }

        } catch (err) {
            return res.redirect('http://localhost:3000/orders?payment=error');
        }
    });
    app.use("/vnpay", router);
};

export default vnpayRoutes;
