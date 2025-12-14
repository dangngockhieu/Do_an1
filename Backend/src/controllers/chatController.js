'use strict';
import * as chatService from '../services/chatService.js';
import prisma from '../lib/prisma.js';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";            
import timezone from "dayjs/plugin/timezone.js";  

dayjs.extend(utc);
dayjs.extend(timezone);

// Tạo phản hồi chat 
export const handleChat = async (req, res) => {
    try {
        const nowVN = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        const { question, context } = req.body;
        const userID = req.user ? req.user.id : null; 

        if (!question) {
            return res.status(200).json({ EC: 1, EM: "Vui lòng nhập câu hỏi!", DT: null });
        }

        const aiResponse = await chatService.generateChatResponse(question, context);

        if (userID) {
            try {
                // Lưu tin nhắn User
                await prisma.chatMessage.create({
                    data: {  
                        userID: userID,
                        content: question,
                        role: 'USER',
                        createdAt: nowVN
                    }
                });

                // Lưu tin nhắn AI
                await prisma.chatMessage.create({
                    data: { 
                        userID: userID,
                        content: aiResponse.reply_message,
                        role: 'AI',
                        createdAt: nowVN,
                        productData: aiResponse.suggested_products
                    }
                });
            } catch (err) {
                console.error("Lỗi lưu DB:", err);
            }
        }

        return res.status(200).json({ EC: 0, EM: "Thành công", DT: aiResponse });

    } catch (error) {
        console.error("Lỗi Controller:", error);
        return res.status(200).json({ EC: -1, EM: "Lỗi hệ thống", DT: null });
    }
};

// Lấy lịch sử chat của người dùng
export const getChatHistory = async (req, res) => {
    try {
        const userID = req.user ? req.user.id : null;
        if (!userID) {
            return res.status(401).json({
                EC: -1,
                EM: "Vui lòng đăng nhập để xem lịch sử chat.",
                DT: null
            });
        }
        const history = await chatService.getChatHistory(userID);

        return res.status(200).json({
            EC: 0,
            EM: "Lấy lịch sử chat thành công.",
            DT: history
        });
    } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi hệ thống, vui lòng thử lại sau.",
            DT: null
        });
    }
};
