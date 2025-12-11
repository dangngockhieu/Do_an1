import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux"; 
import "./AiChatWidget.scss";
import { FaRobot, FaTimes, FaRedo, FaArrowUp } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { toast } from "react-toastify";
import { askAiChat, getAiChatHistory, getAllProducts } from "../../../services/apiServices"; 
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { useNavigate } from "react-router-dom";
const AiChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputStr, setInputStr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  
  // Lấy trạng thái đăng nhập từ Redux
  const { isAuthenticated } = useSelector((state) => state.user);
  
  // Ref để tự động cuộn xuống cuối
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAllProducts = async () => {
    try {
      const res = await getAllProducts();
      if (res && res.EC === 0) {
        setAllProducts(res.DT);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm", error);
    }
  };

  // Tải danh sách sản phẩm khi component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Tự động cuộn khi có tin nhắn mới hoặc khi mở widget
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // LOAD LỊCH SỬ CHAT HOẶC HIỂN THỊ CHÀO MỪNG
  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated){
        toast.info("Đăng nhập để có trải nghiệm AI tốt hơn nhé!");
      }
      else if (isAuthenticated) {
            fetchHistory();
      } else if (messages.length === 0) {
          setMessages([{
              role: 'AI',
              content: 'Xin chào! Bitu có thể giúp gì cho bạn hôm nay? ',
              productData: []
          }]);
        }
    }
  }, [isOpen, isAuthenticated]);

  const fetchHistory = async () => {
    try {
        const res = await getAiChatHistory();
        if (res && res.EC === 0) {
            setMessages(res.DT);
        }
    } catch (error) {
        console.error("Lỗi tải lịch sử chat", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputStr.trim()) return;

    const userMsg = inputStr;
    setInputStr(""); 

    // Optimistic Update: Hiện tin nhắn user lên màn hình ngay
    setMessages((prev) => [...prev, { role: 'USER', content: userMsg, productData: [] }]);
    setIsLoading(true);

    try {
      // Gọi API hỏi AI
      const res = await askAiChat(userMsg, allProducts); 

      if (res && res.EC === 0) {
        const aiData = res.DT;
        // Cập nhật câu trả lời từ AI
        setMessages((prev) => [...prev, { 
            role: 'AI', 
            content: aiData.reply_message, 
            productData: aiData.suggested_products 
        }]);
      } else {
         // Xử lý lỗi logic từ Backend
         setMessages((prev) => [...prev, { role: 'AI', content: res?.EM || "Có lỗi xảy ra.", productData: [] }]);
      }
    } catch (error) {
      // Xử lý lỗi mạng / server crash
      setMessages((prev) => [...prev, { role: 'AI', content: "Mất kết nối với Bitu rồi, bạn thử lại sau nhé!", productData: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  }

  // Render danh sách sản phẩm (Carousel)
  const renderProductCarousel = (products) => {
    if (!products || !Array.isArray(products) || products.length === 0) return null;

    return (
        <div className="product-carousel">
            {products.map((prod, index) => (
                <div key={prod.id || index} className="chat-product-card">
                    <div className="card-top">
                        <BsStars className="card-sparkle" />
                        <img 
                            src={`${BASE_URL}${prod.image}` || "/no-image.png"} 
                            alt={prod.name} 
                            onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"} 
                        />
                    </div>
                    <div className="card-info">
                        <h4>{prod.name}</h4>
                        <div className="prices">
                            <span className="current">
                                {prod.price ? Number(prod.price).toLocaleString('vi-VN') : 'Liên hệ'}₫
                            </span>
                        </div>
                        {prod.reason && <div className="ai-reason">{prod.reason}</div>}
                        
                        <div className="card-actions">
                            <button 
                                className="btn-buy" 
                                onClick={() => navigate(`/product/${prod.id}`)}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="ai-widget-container">
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="title">
            <div className="avatar"><FaRobot /></div>
            <span>Trợ lý AI - Bitu</span>
            <BsStars className="sparkles" />
          </div>
          <div className="controls">
            <button onClick={fetchHistory} title="Làm mới lịch sử chat"><FaRedo /></button>
            <button onClick={() => setIsOpen(false)} title="Đóng chat"><FaTimes /></button>
          </div>
        </div>

        <div className="chat-body">
          {messages.map((msg, idx) => {
             const role = msg.role ? msg.role.toUpperCase() : 'USER';
             const isBot = role === 'AI' || role === 'ASSISTANT'; 
             
             return (
                <div key={idx} className={`message-row ${isBot ? 'bot' : 'user'}`}>
                    {isBot && <div className="msg-avatar"><FaRobot /></div>}
                    
                    <div className="msg-content-wrapper">
                        {msg.content && <div className="bubble">{msg.content}</div>}
                        
                        {isBot && renderProductCarousel(msg.productData)}
                    </div>
                </div>
             )
          })}
          
          {isLoading && (
            <div className="message-row bot">
                 <div className="msg-avatar"><FaRobot /></div>
                 <div className="bubble loading">
                    <span>.</span><span>.</span><span>.</span>
                 </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input 
            type="text" 
            placeholder="Bạn cần hỗ trợ gì?" 
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading} 
          />
          <button 
            className="send-btn" 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputStr.trim()}
          >
            <FaArrowUp />
          </button>
        </div>
         <div className="disclaimer">
            Thông tin được AI hỗ trợ chỉ mang tính chất tham khảo
          </div>
      </div>

      {!isOpen && (
        <button className="ai-floating-btn" onClick={() => setIsOpen(true)}>
          <FaRobot className="icon-robot" />
          <span className="pulse-ring"></span>
        </button>
      )}
    </div>
  );
};

export default AiChatWidget;