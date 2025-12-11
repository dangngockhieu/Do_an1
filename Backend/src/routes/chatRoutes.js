import express from "express";
import { handleChat, getChatHistory } from '../controllers/chatController.js';
import { jwtAuth } from '../middleware/Auth/jwtAuth.js';
const router = express.Router();

const chatRoutes = (app) => {
    
    // Đường dẫn API: POST /chat/ask
    router.post("/ask", jwtAuth, handleChat);
    router.get("/history", jwtAuth, getChatHistory);

    // Gắn router vào prefix /api/chat
    app.use("/chat", router);
};

export default chatRoutes;