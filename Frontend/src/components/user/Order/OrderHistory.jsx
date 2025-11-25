import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './OrderHistory.scss';
import img from '../../../assets/order.png';
import { getMyOrders, cancelOrder, createReview, getOrderItem } from '../../../services/apiServices';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

    const handleReview = async (orderID) => {
        const order = orders.find(o => o.id === orderID);
        if (!order) return toast.error('Không tìm thấy đơn hàng');

        try {
            setLoading(true);
            const res = await getOrderItem(orderID);
            if (res && res.EC === 0) {
                const fetchedItems = res.DT || [];
                setReviewItems(fetchedItems);

                // === FIX: Tự động chọn sản phẩm đầu tiên trong danh sách ===
                if (fetchedItems.length > 0) {
                    setSelectedReviewItem(fetchedItems[0]); // Chọn item đầu tiên
                } else {
                    setSelectedReviewItem(null);
                }
                // ========================================================

                setReviewRating(5);
                setReviewComment('');
                setReviewModalOpen(true);
            } else {
                toast.error(res?.EM || 'Lỗi khi lấy sản phẩm trong đơn');
            }
        } catch (err) {
            console.error(err);
            toast.error('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    // Review modal states
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewItems, setReviewItems] = useState([]);
    const [selectedReviewItem, setSelectedReviewItem] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const submitReview = async () => {
        if (!selectedReviewItem) return toast.error('Vui lòng chọn sản phẩm để đánh giá');
        const productId = selectedReviewItem.product?.id || selectedReviewItem.productID || selectedReviewItem.productId;
        if (!productId) return toast.error('Không xác định được sản phẩm');

        try {
            setSubmittingReview(true);
            const res = await createReview(productId, reviewRating, reviewComment);
            if (res && res.EC === 0) {
                toast.success('Cảm ơn bạn đã đánh giá sản phẩm');
                setReviewModalOpen(false);
                fetchOrders();
            } else {
                toast.error(res?.EM || 'Đã có lỗi khi gửi đánh giá');
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.EM || err.message || 'Lỗi kết nối');
        } finally {
            setSubmittingReview(false);
        }
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
        const d = dateString || null;
        const dateObj = d ? new Date(d) : null;
        if (!dateObj || isNaN(dateObj.getTime())) return '—';
        return dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
                                            <span><strong>Ngày đặt:</strong> {formatDate(item.orderDate || item.createdAt)}</span>
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

            {reviewModalOpen && (
                <div className="review-modal-overlay">
                    <div className="review-modal">
                        <div className="review-left">
                            <h3>Sản phẩm trong đơn</h3>
                            <div className="review-items-list">
                                {reviewItems && reviewItems.length > 0 ? (
                                    reviewItems.map((it) => {
                                        const itemProdId = it.productID || it.productId || (it.product && it.product.id);
                                        const prodName = it.name || (it.product && it.product.name) || it.productName || 'Sản phẩm';
                                        const imageUrl = it.imageUrl;
                                        const isActive = selectedReviewItem && (
                                            (selectedReviewItem.productID && selectedReviewItem.productID === itemProdId) ||
                                            (selectedReviewItem.product && selectedReviewItem.product.id === itemProdId) ||
                                            (selectedReviewItem.id && selectedReviewItem.id === it.id)
                                        );

                                        return (
                                            <div key={`${itemProdId}-${prodName}`} className={`review-item ${isActive ? 'active' : ''}`} onClick={() => setSelectedReviewItem(it)}>
                                                <div className="ri-left">
                                                    <img className="ri-thumb" src={imageUrl ? `${BASE_URL}${imageUrl}` : '/no-image.png'} alt={prodName} onError={(e) => { e.target.src = '/no-image.png' }} />
                                                </div>
                                                <div className="ri-main">
                                                    <div className="ri-name">{prodName}</div>
                                                    <div className="ri-qty">Số lượng: {it.quantity || 1}</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div>Không có sản phẩm để đánh giá</div>
                                )}
                            </div>
                        </div>
                        <div className="review-right">
                            <h3>Đánh giá</h3>
                            {selectedReviewItem ? (
                                <div className="review-form">
                                    <div className="rf-prod-name">{(selectedReviewItem.product && selectedReviewItem.product.name) || selectedReviewItem.productName || selectedReviewItem.name}</div>
                                    <label>Điểm</label>
                                    <select value={reviewRating} onChange={(e) => setReviewRating(+e.target.value)}>
                                        <option value={5}>5 - Xuất sắc</option>
                                        <option value={4}>4 - Tốt</option>
                                        <option value={3}>3 - Trung bình</option>
                                        <option value={2}>2 - Kém</option>
                                        <option value={1}>1 - Rất kém</option>
                                    </select>
                                    <label>Bình luận (tùy chọn)</label>
                                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Viết nhận xét của bạn..." />
                                    <div className="rf-actions">
                                        <button className="btn btn-cancel" onClick={() => setReviewModalOpen(false)}>Đóng</button>
                                        <button className="btn btn-review" onClick={submitReview} disabled={submittingReview}>{submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-selected">Chọn sản phẩm ở bên trái để đánh giá</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
