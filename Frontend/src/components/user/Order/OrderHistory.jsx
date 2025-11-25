import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './OrderHistory.scss';
import img from '../../../assets/order.png';
import { getMyOrders, cancelOrder } from '../../../services/apiServices';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING');

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabs = [
        { id: 'PENDING', label: 'Chờ xác nhận' },
        { id: 'SHIPPING', label: 'Chờ giao hàng' },
        { id: 'COMPLETED', label: 'Thành công' },
        { id: 'CANCELLED', label: 'Đã hủy' },
    ];
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");

        if (paymentStatus) {
            if (paymentStatus === "success") {
                toast.success("Thanh toán VNPay thành công!");
            } else if (paymentStatus === "failed") {
                toast.error("Thanh toán thất bại hoặc bị hủy.");
            } else if (paymentStatus === "error") {
                toast.error("Có lỗi xảy ra trong quá trình xử lý.");
            }
            const timer = setTimeout(() => {
                setSearchParams({}); 
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [searchParams, setSearchParams]);

    // LẤY DANH SÁCH ĐƠN HÀNG
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let res = await getMyOrders();
            if (res && res.EC === 0) {
                // Sắp xếp đơn mới nhất lên đầu
                const sortedOrders = res.DT.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } else {
                console.log("Lỗi data:", res.EM);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    // Xử lý Hủy Đơn
    const handleCancelOrder = async (orderID) => {
        if (!window.confirm(`Bạn chắc chắn muốn hủy đơn hàng #${orderID}?`)) return;

        try {
            let res = await cancelOrder(orderID);
            if (res && res.EC === 0) {
                toast.success("Đã hủy đơn hàng thành công.");
                fetchOrders(); 
            } else {
                toast.error(res.EM || "Hủy đơn thất bại");
            }
        } catch (error) {
            console.log(error);
            toast.error("Lỗi kết nối server");
        }
    };

    const handleBuyAgain = (item) => {
        navigate('/');
    };

    const handleReview = (orderID) => {
        toast.info("Chức năng đánh giá đang phát triển!");
    };

    const getFilteredOrders = () => {
        if (!orders) return [];
        return orders.filter(order => {
            const status = order.status; 
            switch (activeTab) {
                case 'PENDING': return status === 'PENDING' || status === 'UNPAID';
                case 'SHIPPING': return status === 'SHIPPING' || status === 'CONFIRMED';
                case 'COMPLETED': return status === 'COMPLETED';
                case 'CANCELLED': return status === 'CANCELLED';
                default: return false;
            }
        });
    };

    const filteredOrders = getFilteredOrders();

    const formatCurrency = (amount) => {
        const value = amount ? amount : 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN') + ' ' + new Date(dateString).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="order-history-container">
            <h2 className="title">Đơn Hàng Của Tôi</h2>
            <div className="tabs-container">
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="loading-text">Đang tải dữ liệu...</div>
            ) : (
                <div className="order-list-content">
                    {filteredOrders && filteredOrders.length > 0 ? (
                        <div className="order-items">
                            {filteredOrders.map((item) => (
                                <div key={item.id} className="order-card">
                                    {/* Header Card */}
                                    <div className="card-header">
                                        <span className="order-id">Mã đơn: #{item.id}</span>
                                        <span className={`status-text ${item.status}`}>
                                            {item.status === 'PENDING' && 'CHỜ XÁC NHẬN'}
                                            {item.status === 'SHIPPING' && 'ĐANG VẬN CHUYỂN'}
                                            {item.status === 'COMPLETED' && 'GIAO HÀNG THÀNH CÔNG'}
                                            {item.status === 'CANCELLED' && 'ĐÃ HỦY'}
                                        </span>
                                    </div>
                                    
                                    <hr />

                                    <div className="card-body">
                                        <div className="info-row">
                                            <span><strong>Ngày đặt:</strong> {formatDate(item.createdAt)}</span>
                                            <span><strong>Thanh toán:</strong> {item.paymentMethod === 'BANK' ? 'VNPay' : 'Tiền mặt (COD)'}</span>
                                        </div>
                                    </div>

                                    <hr />

                                    <div className="card-footer">
                                        <div className="total-money">
                                            Tổng tiền: <span>{formatCurrency(item.totalPrice || item.payment?.amount)}</span>
                                        </div>
                                        
                                        <div className="action-buttons">
                                            {item.status === 'COMPLETED' && (
                                                <>
                                                    <button className="btn btn-review" onClick={() => handleReview(item.id)}>Đánh Giá</button>
                                                    <button className="btn btn-buy-again" onClick={() => handleBuyAgain(item)}>Mua Lại</button>
                                                </>
                                            )}

                                            {item.status === 'CANCELLED' && (
                                                <button className="btn btn-buy-again" onClick={() => handleBuyAgain(item)}>Mua Lại</button>
                                            )}

                                            {item.status === 'PENDING' && (
                                                 <button className="btn btn-cancel" onClick={() => handleCancelOrder(item.id)}>Hủy Đơn</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-orders-img">
                            <img src={img} alt="empty" />
                            <p>Chưa có đơn hàng nào ở mục này</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
