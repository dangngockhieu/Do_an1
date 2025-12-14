'use strict';
import express from "express";
import { handleChat, getChatHistory } from '../controllers/chatController.js';
import { jwtAuth } from '../middleware/Auth/jwtAuth.js';
const router = express.Router();

const chatRoutes = (app) => {
    
    // Hỏi ChatBot
    router.post("/ask", jwtAuth, handleChat);

    // Lấy lịch sử chat
    router.get("/history", jwtAuth, getChatHistory);

    app.use("/chat", router);
};

export default chatRoutes;