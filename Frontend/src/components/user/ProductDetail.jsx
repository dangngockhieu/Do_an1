import { useState, useRef, useEffect } from "react";
import "./ProductDetail.scss";
const BASE_URL = import.meta.env.VITE_BACKEND || "http://localhost:8080";
import { useLocation } from "react-router-dom";
import { FaStar, FaRegCircleCheck } from "react-icons/fa6"; 
import {getReviewsByProductId} from "../../services/apiServices";

const ProductDetail = () => {
  // ===== DỮ LIỆU SẢN PHẨM VÀ ĐÁNH GIÁ =====
  const location = useLocation();
  const product = location.state?.product ;
  
  // Khởi tạo state reviewsData với cấu trúc an toàn để tránh lỗi truy cập undefined khi render lần đầu
  // Giả sử API trả về đối tượng có thuộc tính DT là mảng reviews
  const [reviewsData, setReviewsData] = useState([]); 

  useEffect(() => {
    const fetchReviews = async () => {
      // Đảm bảo product.id tồn tại trước khi gọi API
      if (product && product.id) {
        try {
            const response = await getReviewsByProductId(product.id);
            console.log("Reviews response:", response);
            // Giả sử response trả về { EC: 0, DT: [...] }
            if (response && response.DT) {
                setReviewsData(response.DT); // response.DT là mảng các review
            }
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error);
        }
      }
    };
    fetchReviews();
  }, [product?.id]); // Sử dụng optional chaining để đảm bảo product.id tồn tại

  const [filter, setFilter] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [indexImage, setIndexImage] = useState(0);
  const reviewsRef = useRef(null);

  const handleScrollToReviews = () => {
    reviewsRef.current.scrollIntoView({
      behavior: 'smooth', 
      block: 'start',    
    });
  };

  const allReviews = reviewsData || []; 
  const totalReviewsCount = allReviews.length;

  const filteredReviews =
    filter === 0
      ? allReviews
      : allReviews.filter((r) => r.rating === filter);

  const paginatedReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  const handleShowMore = () => {
    if (hasMore) setVisibleCount((prev) => prev + 5);
    else setVisibleCount(5);
  };

  const hasDiscount = product?.coupon > 0;
  const newPrice = product?.price?.toLocaleString("vi-VN") + "đ";
  const oldPrice = product?.originalPrice?.toLocaleString("vi-VN") + "đ";
  if (!product) {
      return <div>Đang tải thông tin sản phẩm...</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-header">
        
        <div className="left-column">
          <div className="product-images">
            <img
              src={`${BASE_URL}${product.imageUrls[indexImage]}`}
              alt={product.name}
              className="main-img"
            />
            <div className="thumbs">
              {product.imageUrls.map((url, idx) => (
                <img key={idx} onClick={() => setIndexImage(idx)} src={`${BASE_URL}${url}`} alt="" />
              ))}
            </div>
          </div>

          <div className="product-policies">
            <div className="policy-header">
                <h3>Chính sách sản phẩm</h3>
            </div>
            <div className="policy-grid">
                <div className="policy-item"><FaRegCircleCheck className="policy-icon"/>Hàng chính hãng - Chất lượng tốt</div>
                <div className="policy-item"><FaRegCircleCheck className="policy-icon"/>Giao hàng miễn phí toàn quốc</div>
                <div className="policy-item"><FaRegCircleCheck className="policy-icon"/>Hỗ trợ cài đặt miễn phí</div>
                <div className="policy-item"><FaRegCircleCheck className="policy-icon"/>Kỹ thuật viên hỗ trợ trực tuyến</div>
                <div className="policy-item"><FaRegCircleCheck className="policy-icon"/>Chiết khấu dành riêng cho doanh nghiệp</div>
            </div>
          </div>
        </div> 


        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="rating">
            <span>{product.avgRating} <FaStar className="star" /> ({product.totalReviews} đánh giá)</span>
            
            <span className="view-reviews" onClick={handleScrollToReviews}>Xem đánh giá</span>
          </div>

          <div className={`price ${!hasDiscount ? "center" : ""}`}>
            <span className="new">{newPrice}</span>
            {hasDiscount && <span className="old">{oldPrice}</span>}
            {hasDiscount && <span className="discount">-{product.coupon}%</span>}
          </div>

          <div className="specs">
            <div className="spec-item"><strong>CPU</strong><span>{product.cpu}</span></div>
            <div className="spec-item"><strong>RAM</strong><span>{product.ram}</span></div>
            <div className="spec-item"><strong>Ổ cứng</strong><span>{product.storage}</span></div>
            <div className="spec-item"><strong>Màn hình</strong><span>{product.screen}</span></div>
            <div className="spec-item"><strong>Card đồ họa</strong><span>{product.graphicsCard}</span></div>
            <div className="spec-item"><strong>Pin</strong><span>{product.battery}</span></div>
            <div className="spec-item"><strong>Trọng lượng</strong><span>{product.weight}</span></div>
            <div className="spec-item"><strong>Năm ra mắt</strong><span>{product.releaseYear}</span></div>
          </div>
          <div className="description">
            <h3>Thông tin sản phẩm</h3>
            <p>{product.infor}</p>
            <p><strong>Bảo hành:</strong> {product.warranty}</p>
            <p><strong>Còn lại:</strong> {product.quantity} sản phẩm</p>
          </div>
          
          <div className="actions">
            <button className="add-cart">Add To Cart</button>
            <button className="buy-now">Buy Now</button>
          </div>

        </div>
      </div>
      <div className="reviews" ref={reviewsRef}>
        <h3>Đánh giá & Bình luận</h3>
        <div className="review-container">
          {/* Tổng quan điểm */}
          <div className="review-summary">
            <div className="score">{product.avgRating} <FaStar className="star" /></div>
            <p>{totalReviewsCount} lượt đánh giá</p> 

            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = allReviews.filter((r) => r.rating === star).length; 
                const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                return (
                  <div key={star} className="rating-row">
                    <span className="star-breakdown">
                        <span style={{marginRight: '4px'}}>{star}</span>
                        <FaStar className="star-gold" />
                    </span>
                    <div className="bar"><div className="fill" style={{ width: `${percent}%` }}></div></div>
                    <span className="count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danh sách review */}
          <div className="review-content">
            <div className="filter-buttons">
              {[0, 5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  className={filter === star ? "active" : ""}
                  onClick={() => {
                    setFilter(star);
                    setVisibleCount(5);
                  }}
                >
                  {star === 0 ? "Tất cả" : (
                    <>
                      <span style={{marginRight: '4px'}}>{star}</span>
                      <FaStar className="filter-star" />
                      </>
                  )}
                </button>
              ))}
            </div>

            <div className="review-list">
              {paginatedReviews.length > 0 ? (
                paginatedReviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <strong>{r.userName}</strong>
                    <div className="stars">
                        {Array(r.rating).fill(null).map((_, idx) => (
                            <FaStar key={idx} className="star-review" />
                        ))}
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>Chưa có bình luận nào {filter > 0 ? `với ${filter} sao.` : '.'}</p>
              )}
            </div>

            {filteredReviews.length > 5 && (
              <button className="show-more" onClick={handleShowMore}>
                {hasMore ? "Xem thêm bình luận" : "Thu gọn"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;