import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa6";
import acer from "../../assets/acer.jpg";
import asus from "../../assets/asus.jpg";
import dell from "../../assets/dell.jpg";
import honor from "../../assets/honor.jpg";
import hp from "../../assets/hp.jpg";
import iphone from "../../assets/iphone.jpg";
import lenovo from "../../assets/lenovo.jpg";
import macbook from "../../assets/macbook.jpg";
import msi from "../../assets/msi.jpg";
import oppo from "../../assets/oppo.jpg";
import realme from "../../assets/realme.jpg";
import samsung from "../../assets/samsung.jpg";
import vivo from "../../assets/vivo.jpg";
import xiaomi from "../../assets/xiaomi.jpg";
import header1 from "../../assets/header1.jpg";
import header2 from "../../assets/header2.jpg";
import header3 from "../../assets/header3.jpg";
import header4 from "../../assets/header4.jpg";
import header5 from "../../assets/header5.jpg";
import header6 from "../../assets/header6.jpg";
import header7 from "../../assets/header7.jpg";
import header8 from "../../assets/header8.jpg";
import header9 from "../../assets/header9.jpg";
import header10 from "../../assets/header10.jpg";

import { getFilteredProducts } from "../../services/apiServices";
import "./Product.scss";
const BASE_URL = import.meta.env.VITE_BACKEND ;
const FACTORIES = [
  { id: 1, name: "MACBOOK", image: macbook },
  { id: 2, name: "ASUS", image: asus },
  { id: 3, name: "MSI", image: msi },
  { id: 4, name: "DELL", image: dell },
  { id: 5, name: "HP", image: hp },
  { id: 6, name: "ACER", image: acer },
  { id: 7, name: "LENOVO", image: lenovo },
  { id: 8, name: "IPHONE", image: iphone },
  { id: 9, name: "SAMSUNG", image: samsung },
  { id: 10, name: "XIAOMI", image: xiaomi },
  { id: 11, name: "OPPO", image: oppo },
  { id: 12, name: "VIVO", image: vivo },
  { id: 13, name: "REALME", image: realme },
  { id: 14, name: "HONOR", image: honor },
];


const FEATURE_NAMES = [
  { id: 1, name: "Văn phòng" },
  { id: 2, name: "Gaming" },
  { id: 3, name: "Mỏng nhẹ" },
  { id: 4, name: "Đồ họa" },
  { id: 5, name: "Cảm ứng" },
  { id: 6, name: "Laptop AI" },
  { id: 7, name: "Điện thoại 5G" },
  { id: 8, name: "Điện thoại AI" },
  { id: 9, name: "Gaming Phone" },
  { id: 10, name: "Phổ thông 4G" },
  { id: 11, name: "Điện thoại gập" },
];

const LAPTOP_FILTERS = {
  CPU: ["Tất cả", "Intel Core i3", "Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M2", "Apple M3", "Apple M4", "Apple M5"],
  RAM: ["Tất cả", "8GB", "12GB", "16GB", "24GB", "32GB", "64GB"],
  "Cạc đồ họa rời": ["Tất cả", "RTX 30 Series", "RTX 40 Series", "RTX 50 Series"],
  "Ổ cứng": ["Tất cả", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
  "Kích thước màn hình": ["Tất cả", "13.3", "14", "15.6", "17"]
};

const PHONE_FILTERS = {
  RAM: ["Tất cả", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"],
  "Dung Lượng Bộ Nhớ": ["Tất cả", "64GB", "128GB", "256GB", "512GB", "1TB"],
  "Màn Hình": ["Tất cả", "AMOLED", "OLED", "LCD"],
  "Kích thước màn hình": ["Tất cả", "5.5", "6.1", "6.5", "7.0"], 
  Pin: ["Tất cả", "3000", "4000", "5000", "6000", "7000"], 
};

const LAPTOP_PRICE_OPTIONS = [
  { id: 1, label: "Tất cả", range: [null, null] },
  { id: 2, label: "Dưới 10 triệu", range: [0, 10000000] },
  { id: 3, label: "10 - 15 triệu", range: [10000000, 15000000] },
  { id: 4, label: "15 - 20 triệu", range: [15000000, 20000000] },
  { id: 5, label: "20 - 30 triệu", range: [20000000, 30000000] },
  { id: 6, label: "Trên 30 triệu", range: [30000000, null] },
];

const PHONE_PRICE_OPTIONS = [
  { id: 1, label: "Tất cả", range: [null, null] },
  { id: 2, label: "Dưới 5 triệu", range: [0, 5000000] },
  { id: 3, label: "5 - 10 triệu", range: [5000000, 10000000] },
  { id: 4, label: "10 - 20 triệu", range: [10000000, 20000000] },
  { id: 5, label: "20 - 30 triệu", range: [20000000, 30000000] },
  { id: 6, label: "Trên 30 triệu", range: [30000000, null] },
];

const Product = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("LAPTOP");
  const headers = [header1, header2, header3, header4, header5, header6, header7, header8, header9, header10];
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentFactories, setCurrentFactories] = useState(FACTORIES.slice(0, 7));
  const [currentPrices, setCurrentPrices] = useState(LAPTOP_PRICE_OPTIONS);
  const [currentFeatures, setCurrentFeatures] = useState(FEATURE_NAMES.slice(0, 6));
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);

  const [selectedFactories, setSelectedFactories] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [customPrice, setCustomPrice] = useState({ min: "", max: "" });

  const handleNavigate = (product) => {
    navigate(`/product/${product.id}`);
  };

  const fetchProducts = async () => {
    try {
      const res = await getFilteredProducts(category, {}); // gọi API
    if (res?.EC === 0 && res?.DT) {
      setProducts(res.DT.products || []);
      setCount(res.DT.count || 0);
    } else {
      setProducts([]);
      setCount(0);
    }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const renderProducts = (list = []) =>
      list.map((item) => {
        const imgUrl = item.imageUrls?.length
    ? (item.imageUrls[0].startsWith("/") ? `${BASE_URL}${item.imageUrls[0]}` : item.imageUrls[0])
    : "/no-image.png";
        const avgRating = Number(item.avgRating || 0).toFixed(2);
        const totalReviews = item.totalReviews || 0;
  
        const hasDiscount = item.coupon > 0;
        const newPrice = item.price?.toLocaleString("vi-VN") + "đ";
        const oldPrice = item.originalPrice?.toLocaleString("vi-VN") + "đ";
  
        return (
          <div key={item.id} className="product-card">
            {hasDiscount && <div className="discount">-{item.coupon}%</div>}
            <img
              src={imgUrl}
              alt={item.name}
              onClick={() => handleNavigate(item)}
              style={{ cursor: "pointer" }}
            />
            <div className="info">
              <div className="rating">
                <FaStar className="star"/> {avgRating} <span>({totalReviews})</span>
              </div>
              <h3>{item.name}</h3>
              <div className={`price ${!hasDiscount ? "center" : ""}`}>
                <span className="new">{newPrice}</span>
                {hasDiscount && <span className="old">{oldPrice}</span>}
              </div>
  
              <div className="actions">
                <button className="add-cart" onClick={() => handleNavigate(item)}>
                  Add To Cart
                </button>
                <button className="buy-now" onClick={() => handleNavigate(item)}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        );
      });

  useEffect(() => {
    if (category === "LAPTOP") {
      setCurrentFactories(FACTORIES.slice(0, 7));
      setCurrentPrices(LAPTOP_PRICE_OPTIONS);
      setCurrentFeatures(FEATURE_NAMES.slice(0, 6));
    } else {
      setCurrentFactories(FACTORIES.slice(7));
      setCurrentPrices(PHONE_PRICE_OPTIONS);
      setCurrentFeatures(FEATURE_NAMES.slice(6));
    }
    setSelectedFactories([]);
    setSelectedFeatures([]);
    setSelectedFilters({});
    setSelectedPrice(null);
    setCustomPrice({ min: "", max: "" });
    fetchProducts();
  }, [category]);

  const currentFilters = category === "LAPTOP" ? LAPTOP_FILTERS : PHONE_FILTERS;
  const filterKeys = Object.keys(currentFilters);
  const bannerImages = category === "LAPTOP" ? headers.slice(0, 5) : headers.slice(5, 10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [bannerImages]);

  const toggleFactory = (id) => {
    setSelectedFactories((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const toggleFeature = (id) => {
    setSelectedFeatures((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const toggleOption = (key, option) => {
    setSelectedFilters((prev) => {
      const current = prev[key] || [];
      if (option === "Tất cả") return { ...prev, [key]: [] };
      const updated = current.includes(option)
        ? current.filter((x) => x !== option)
        : [...current.filter((x) => x !== "Tất cả"), option];
      return { ...prev, [key]: updated };
    });
  };

  const handlePriceSelect = (id) => {
    setSelectedPrice((prev) => (prev === id ? null : id));
    setCustomPrice({ min: "", max: "" });
  };

  const handleInputMinPrice = (e) => {
    setCustomPrice((prev) => ({ ...prev, min: e.target.value }));
    setSelectedPrice(null);
  };

  const handleInputMaxPrice = (e) => {
    setCustomPrice((prev) => ({ ...prev, max: e.target.value }));
    setSelectedPrice(null);
  };

  const handleFilter = async () => {
    const filters = {
      factories: selectedFactories.map((id) => currentFactories.find((b) => b.id === id).name),
      product_features: selectedFeatures.map((id) => currentFeatures.find((f) => f.id === id).id),
      specs: selectedFilters,
      price:
        customPrice.min && customPrice.max
          ? customPrice
          : selectedPrice
          ? {
              min: currentPrices.find((p) => p.id === selectedPrice).range[0],
              max: currentPrices.find((p) => p.id === selectedPrice).range[1],
            }
          : null,
    };

    try {
      const data = await getFilteredProducts(category, filters);
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi lọc sản phẩm:", err);
    }
  };

  const handleReset = () => {
    setSelectedFactories([]);
    setSelectedFeatures([]);
    setSelectedFilters({});
    setSelectedPrice(null);
    setCustomPrice({ min: "", max: "" });
    setProducts([]);
  };

  return (
    <div className="product-page">
      <div className="category-toggle">
        <button className={category === "LAPTOP" ? "active" : ""} onClick={() => setCategory("LAPTOP")}>
          Laptop
        </button>
        <button className={category === "PHONE" ? "active" : ""} onClick={() => setCategory("PHONE")}>
          Phone
        </button>
      </div>

      <div className="header__hero-image">
        <img src={bannerImages[currentBanner]} alt="Banner" />
        <div className="banner-dots">
          {bannerImages.map((_, i) => (
            <span
              key={i}
              className={`dot ${currentBanner === i ? "active" : ""}`}
              onClick={() => setCurrentBanner(i)}
            ></span>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="filter-section">
          <div className="filter-header">
            <h3>Bộ lọc chi tiết</h3>
            <div className="filter-buttons">
              <button className="btn-filter" onClick={handleFilter}>
                Lọc
              </button>
              <button className="btn-reset" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          <div className="brand-filter">
            <label>Hãng sản xuất</label>
            <div className="brand-grid">
              {currentFactories.map((brand) => (
                <div
                  key={brand.id}
                  className={`brand-item ${selectedFactories.includes(brand.id) ? "selected" : ""}`}
                  onClick={() => toggleFactory(brand.id)}
                >
                  <img src={brand.image} alt={brand.id} />
                </div>
              ))}
            </div>
          </div>

          <div className="feature-filter">
            <label>Nhu cầu sử dụng</label>
            <div className="feature-grid">
              {currentFeatures.map((f) => (
                <div
                  key={f.id}
                  className={`feature-item ${selectedFeatures.includes(f.id) ? "selected" : ""}`}
                  onClick={() => toggleFeature(f.id)}
                >
                  {f.name}
                </div>
              ))}
            </div>
          </div>

          <div className="filter-item price-filter">
            <label>Khoảng giá (VNĐ)</label>
            <div className="option-grid">
              {currentPrices.map((p) => (
                <div
                  key={p.id}
                  className={`option-item ${selectedPrice === p.id ? "selected" : ""}`}
                  onClick={() => handlePriceSelect(p.id)}
                >
                  {p.label}
                </div>
              ))}
            </div>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min Price"
                value={customPrice.min}
                onChange={(e) => handleInputMinPrice(e)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max Price"
                value={customPrice.max}
                onChange={(e) => handleInputMaxPrice(e)}
              />
            </div>
          </div>

          {filterKeys.map((key) => (
            <div className="filter-item" key={key}>
              <label>{key}</label>
              <div className="option-grid">
                {currentFilters[key].map((option) => (
                  <div
                    key={option}
                    className={`option-item ${
                      selectedFilters[key]?.includes(option) ? "selected" : ""
                    }`}
                    onClick={() => toggleOption(key, option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="product-list">
          <h3>Kết quả lọc: {count} sản phẩm</h3>
          <div className="product-grid">
            {count > 0 ? renderProducts(products) : <p>Không có sản phẩm thỏa mãn</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
