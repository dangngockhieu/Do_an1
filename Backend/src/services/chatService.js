import model from "../config/geminiConfig.js";
import prisma from "../lib/prisma.js";

export const generateChatResponse = async (question, productContext) => {
    try {
        const contextString = productContext && productContext.length > 0 
            ? JSON.stringify(productContext) 
            : "Không có dữ liệu sản phẩm.";

        const prompt = `
            VAI TRÒ: Bạn là Bitu - Trợ lý ảo bán hàng.
            CONTEXT: ${contextString}
            USER: "${question}"

            NHIỆM VỤ:
            1. Trả lời thân thiện (reply_message).
            2. Tìm sản phẩm phù hợp (suggested_products).

            YÊU CẦU ĐẦU RA (JSON chuẩn, không markdown):
            {
                "reply_message": "Câu trả lời của bạn...",
                "suggested_products": [
                    { 
                        "id": "...", 
                        "name": "...", 
                        "price": 0,   // Để dạng số nguyên
                        "image": "...", // URL ảnh
                        "reason": "Lý do ngắn gọn..." 
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean JSON
        const cleanJson = responseText.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
        
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("AI Error:", error);
        // Fallback để không crash app
        return {
            reply_message: "Bitu đang bận xíu, bạn hỏi lại sau nhé!",
            suggested_products: []
        };
    }
};

export const getChatHistory = async (userID) => {
    const historyChat = await prisma.chatMessage.findMany({ 
        where: { userID: userID },
        orderBy: { createdAt: 'asc' }
    });
    return historyChat;
};