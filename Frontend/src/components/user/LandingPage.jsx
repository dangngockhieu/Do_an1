import banner1 from "../../assets/banner_header1.jpg";
import banner2 from "../../assets/banner_header2.jpg";
import banner3 from "../../assets/banner_header3.jpg";
import banner4 from "../../assets/banner_header4.png";
import { useState, useEffect } from "react";
import './LandingPage.scss';
const LandingPage = () => {
    // ========== Xử lý banner tự động đổi ==========
      const banners = [banner1, banner2, banner3, banner4];
      const [currentBanner, setCurrentBanner] = useState(0);
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 20000); 
    
        return () => clearInterval(interval);
      }, []);
    return (
        <div className="container">
            <section className="header__hero">
                <div className="header__hero-content">
                    <h4>100% Sản Phẩm Chính Hãng</h4>
                    <h1>
                        Trải nghiệm khác biệt <br />
                        <span>Deal hot mỗi ngày</span>
                    </h1>
                    <button className="hero-btn">Mua ngay</button>
                </div>
                <div className="header__hero-image">
                    <img src={banners[currentBanner]} alt="Laptop Gaming" />
                </div>
            </section>
            <section className="bestseller">
  <div className="bestseller__header">
    <h2>Bán chạy</h2>
    <p>Sản phẩm bán chạy của chúng tôi</p>
    <a href="#">Xem tất cả</a>
  </div>

  <div className="bestseller__list">
    {[
      {
        id: 1,
        img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_-_2023-06-08t005130.908.png",
        title: "Laptop ASUS VivoBook Go 14 E1404FA-NK177W",
        rating: 4.8,
        price: "11.890.000đ",
        oldPrice: "14.490.000đ",
        discount: "18%",
      },
      {
        id: 2,
        img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_d_i_7_108.png",
        title: "Laptop Lenovo LOQ 15ARP9 83JC00M3VN",
        rating: 4.33,
        price: "22.490.000đ",
        oldPrice: "24.490.000đ",
        discount: "8%",
      },
      {
        id: 3,
        img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-17-pro-max_3.jpg",
        title: "IPhone 17 Pro Max 256GB",
        rating: 5,
        price: "37.990.000đ",
        oldPrice: "37.990.000đ",
        discount: "0%",
      },
      {
        id: 4,
        img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_3__3.png",
        title: "Samsung Galaxy S25 Ultra 512GB",
        rating: 4.9,
        price: "29.480.000đ",
        oldPrice: "36.810.000đ",
        discount: "20%",
      },
      {
        id: 5,
        img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/r/e/realme-13-plus-5g_6_.jpg",
        title: "Realme 13+ 5G 8GB 256GB",
        rating: 5,
        price: "6.590.000đ",
        oldPrice: "9.490.000đ",
        discount: "31%",
      },
    ].map((item) => (
      <div key={item.id} className="product-card">
        <div className="discount">{item.discount}</div>
        <img src={item.img} alt={item.title} />
        <div className="info">
          <div className="rating">
            ⭐ {item.rating} <span>(3)</span>
          </div>
          <h3>{item.title}</h3>
          <div className="price">
            <span className="new">{item.price}</span>
            <span className="old">{item.oldPrice}</span>
          </div>
          <button>Thêm vào giỏ hàng</button>
        </div>
      </div>
    ))}
  </div>
</section>

        </div>
    );
};
export default LandingPage;