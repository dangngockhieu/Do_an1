'use strict';
import { VNPay, ignoreLogger} from "vnpay";
import dotenv from 'dotenv';
dotenv.config();
const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMNCODE,
    secureSecret: process.env.VNPAY_HASHSECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',  
    testMode: true, 
    hashAlgorithm: 'SHA512', 
    loggerFn: ignoreLogger, 
})

export default vnpay;