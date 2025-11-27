import { useState, useEffect } from "react";
import "./ProductDetail.scss";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = ({ show, setShow, product }) => {
  const [zoomImg, setZoomImg] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        originalPrice: product.originalPrice || "",
        coupon: product.coupon || "",
        quantity: product.quantity || "",
        infor: product.infor || "",
        warranty: product.warranty || "",
        cpu: product.cpu || "",
        ram: product.ram || "",
        storage: product.storage || "",
        screen: product.screen || "",
        graphicsCard: product.graphicsCard || "",
        battery: product.battery || "",
        weight: product.weight || "",
        releaseYear: product.releaseYear || "",
        category: product.category || "",
        factory: product.factory || "",
      });
    }
  }, [product]);

  if (!show || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h4>Chi tiết sản phẩm</h4>

        {/* ========== ẢNH SẢN PHẨM ========== */}
        <div className="image-gallery">
          {/* Lọc các phần tử null/rỗng */}
          {product?.images?.filter(img => img)?.length > 0 ? (
          product.images.filter(img => img).map((img, i) => ( 
            <div key={i} className="gallery-item">
              <img
                src={`${BASE_URL}${img.url?.startsWith("/") ? img.url : "/" + img.url}`}
                alt={`img-${i}`}
                onClick={() =>
                  setZoomImg(`${BASE_URL}${img.url?.startsWith("/") ? img.url : "/" + img.url}`)
                }
                onError={(e) => (e.target.src = "/no-image.png")}
              />
            </div>
          ))
          ) : (
            <p>Không có ảnh</p>
          )}
        </div>

        {/* ========== THÔNG TIN SẢN PHẨM ========== */}
        <div className="detail-info">
          <h5>Thông tin chung</h5>
          <div className="detail-grid">
            <p><strong>Tên:</strong> {form.name}</p>
            <p><strong>Giá:</strong> {form.originalPrice?.toLocaleString()}₫</p>
            <p><strong>Giảm giá:</strong> {form.coupon ?? 0}%</p>
            <p><strong>Số lượng:</strong> {form.quantity}</p>
            <p><strong>Bảo hành:</strong> {form.warranty}</p>
            <p><strong>Năm phát hành:</strong> {form.releaseYear}</p>
            <p><strong>Danh mục:</strong> {form.category}</p>
            <p><strong>Hãng:</strong> {form.factory}</p>
          </div>

          <h5>Thông số kỹ thuật</h5>
          <div className="detail-grid">
            <p><strong>CPU:</strong> {form.cpu}</p>
            <p><strong>RAM:</strong> {form.ram}</p>
            <p><strong>Lưu trữ:</strong> {form.storage}</p>
            <p><strong>Màn hình:</strong> {form.screen}</p>
            <p><strong>Card đồ họa:</strong> {form.graphicsCard}</p>
            <p><strong>Pin:</strong> {form.battery}</p>
            <p><strong>Trọng lượng:</strong> {form.weight}</p>
          </div>

          <div className="detail-group-container">
              <div className="detail-group-item">
                  <h5>Đặc điểm phân loại</h5>
                  {product?.features?.filter(feature => feature)?.length > 0 ? (
                  product.features.filter(feature => feature).map((feature, i) => ( 
                    <div key={feature.id || i} className="detail-extra">{feature.name}</div>
                  ))
                  ) : (
                    <p>Không có Đặc điểm</p>
                  )}
              </div>
              
              {form.infor && (
                <div className="detail-group-item">
                  <h5>Thông tin thêm</h5>
                  <div className="detail-extra">{form.infor}</div>
                </div>
              )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShow(false)}
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Overlay zoom ảnh */}
      {zoomImg && (
        <div className="zoom-overlay" 
          onClick={() => setZoomImg(null)} 
        >
          <div  style={{ width: '100%', height: '100%' }}>
            <TransformWrapper wheel={{ step: 0.2 }} >
              <TransformComponent 
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img src={zoomImg} 
                  alt="zoomed" 
                  className="zoomed-img" 
                  style={{ maxHeight: "90vh", maxWidth: "90vw" }} 
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
