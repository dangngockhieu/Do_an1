import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa6";
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
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BACKEND;

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
  CPU: [
    { label: "Tất cả", name: null },
    { label: "Intel Core i3", name: "i3" },
    { label: "Intel Core i5", name: "i5" },
    { label: "Intel Core i7", name: "i7" },
    { label: "AMD Ryzen 5", name: "ryzen5" },
    { label: "AMD Ryzen 7", name: "ryzen7" },
    { label: "Apple M2", name: "m2" },
    { label: "Apple M3", name: "m3" },
    { label: "Apple M4", name: "m4" },
    { label: "Apple M5", name: "m5" },
  ],
  RAM: ["Tất cả", "8GB", "12GB", "16GB", "24GB", "32GB", "64GB"],
  "Cạc đồ họa rời": [
    { label: "Tất cả", name: null },
    { label: "RTX 30 Series", name: "rtx30" }, 
    { label: "RTX 40 Series", name: "rtx40" },
    { label: "RTX 50 Series", name: "rtx50" },
  ],
  "Bộ nhớ": ["Tất cả", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
  "Kích thước màn hình (inch)": [
    { label: "Tất cả", name: null },
    { label: "13.x", name: "13" }, 
    { label: "14.x", name: "14" },
    { label: "15.x", name: "15" },
    { label: "16.x", name: "16" },
    { label: "17.x", name: "17" },
  ],
};

const PHONE_FILTERS = {
  RAM: ["Tất cả", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"],
  "Bộ nhớ": ["Tất cả", "64GB", "128GB", "256GB", "512GB", "1TB"],
  "Màn Hình": ["Tất cả", "AMOLED", "OLED", "LCD"],
  "Kích thước màn hình (inch)": [
    { label: "Tất cả", name: null },
    { label: "5.x", name: "5" }, 
    { label: "6.x", name: "6" },
    { label: "7.x", name: "7" },
    { label: "8.x", name: "8" },
  ],
  "PIN (mAh)": [
    { label: "Tất cả", name: null },
    { label: "3000+", name: "3000" }, 
    { label: "4000+", name: "4000" },
    { label: "5000+", name: "5000" },
    { label: "6000+", name: "6000" },
    { label: "7000+", name: "7000" },
  ],
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
  const [initialLaptops, setInitialLaptops] = useState([]);
  const [initialLaptopCount, setInitialLaptopCount] = useState(0);
  const [initialPhones, setInitialPhones] = useState([]);
  const [initialPhoneCount, setInitialPhoneCount] = useState(0);
  const [selectedFactories, setSelectedFactories] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [customPrice, setCustomPrice] = useState({ min: "", max: "" });

  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    feature: true,
    price: true,
    specs: {},
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSpecSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      specs: { ...prev.specs, [key]: !prev.specs[key] },
    }));
  };

  const handleNavigate = (p) => navigate(`/product/${p.id}`);

  const fetchProducts = async (type, setData, setCountFn) => {
    try {
      const res = await getFilteredProducts(type, {});
      if (res?.EC === 0 && res?.DT) {
        setData(res.DT.products || []);
        setCountFn(res.DT.count || 0);
      }
    } catch (e) {
      console.error(`Error fetching ${type}:`, e);
    }
  };

  useEffect(() => {
    fetchProducts("LAPTOP", setInitialLaptops, setInitialLaptopCount);
    fetchProducts("PHONE", setInitialPhones, setInitialPhoneCount);
  }, []);

  const renderProducts = (list = []) =>
    list.map((item) => {
      const imgUrl = item.imageUrls?.length
        ? item.imageUrls[0].startsWith("/")
          ? `${BASE_URL}${item.imageUrls[0]}`
          : item.imageUrls[0]
        : "/no-image.png";
      const avgRating = Number(item.avgRating || 0).toFixed(2);
      const totalReviews = item.totalReviews || 0;
      const hasDiscount = item.coupon > 0;
      const newPrice = item.price?.toLocaleString("vi-VN") + "đ";
      const oldPrice = item.originalPrice?.toLocaleString("vi-VN") + "đ";

      return (
        <div key={item.id} className="product-card">
          {hasDiscount && <div className="discount">-{item.coupon}%</div>}
          <img src={imgUrl} alt={item.name} onClick={() => handleNavigate(item)} style={{ cursor: "pointer" }} />
          <div className="info">
            <div className="rating">
              <FaStar className="star" /> {avgRating} <span>({totalReviews})</span>
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
    setSelectedFactories([]);
    setSelectedFeatures([]);
    setSelectedFilters({});
    setSelectedPrice(null);
    setCustomPrice({ min: "", max: "" });

    if (category === "LAPTOP") {
      setCurrentFactories(FACTORIES.slice(0, 7));
      setCurrentPrices(LAPTOP_PRICE_OPTIONS);
      setCurrentFeatures(FEATURE_NAMES.slice(0, 6));
      setProducts(initialLaptops);
      setCount(initialLaptopCount);
    } else {
      setCurrentFactories(FACTORIES.slice(7));
      setCurrentPrices(PHONE_PRICE_OPTIONS);
      setCurrentFeatures(FEATURE_NAMES.slice(6));
      setProducts(initialPhones);
      setCount(initialPhoneCount);
    }
  }, [category, initialLaptops, initialPhones]);

  const currentFilters = category === "LAPTOP" ? LAPTOP_FILTERS : PHONE_FILTERS;
  const filterKeys = Object.keys(currentFilters);

  const toggleOption = (key, value) => {
  setSelectedFilters((prev) => {
    const current = prev[key] || [];

    // Xử lý riêng CPU & Cạc đồ họa rời (có name)
    if (key === "CPU" || key === "Cạc đồ họa rời" || key ==="Kích thước màn hình (inch)" || key ==="PIN (mAh)") {
      const isAll = value === null || value === "all";

      if (isAll) {
        // chọn "Tất cả" → reset chỉ còn "all" (null)
        return { ...prev, [key]: [null] };
      }

      // loại bỏ "Tất cả" nếu đang có
      const cleaned = current.filter((v) => v !== null && v !== "all");

      // toggle giá trị hiện tại
      const updated = cleaned.includes(value)
        ? cleaned.filter((v) => v !== value)
        : [...cleaned, value];

      return { ...prev, [key]: updated };
    }

    // Các filter còn lại (RAM, Bộ nhớ, v.v.)
    const isAll = value === "Tất cả";

    if (isAll) {
      return { ...prev, [key]: ["Tất cả"] };
    }

    const cleaned = current.filter((v) => v !== "Tất cả");
    const updated = cleaned.includes(value)
      ? cleaned.filter((v) => v !== value)
      : [...cleaned, value];

    return { ...prev, [key]: updated };
  });
};




  const handleFilter = async () => {
    // tạo bản sao specs để xử lý riêng CPU và Cạc đồ họa rời
    const processedSpecs = { ...selectedFilters };
    // Chuyển name → label cho CPU
    if (processedSpecs.CPU && processedSpecs.CPU.length > 0) {
      processedSpecs.CPU = processedSpecs.CPU.map((v) => {
        const found = LAPTOP_FILTERS.CPU.find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    if (processedSpecs["PIN (mAh)"] && processedSpecs["PIN (mAh)"].length > 0) {
      processedSpecs["PIN (mAh)"] = processedSpecs["PIN (mAh)"].map((v) => {
        const found = PHONE_FILTERS["PIN (mAh)"].find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    // Chuyển name → label cho Cạc đồ họa rời
    if (processedSpecs["Cạc đồ họa rời"] && processedSpecs["Cạc đồ họa rời"].length > 0) {
      processedSpecs["Cạc đồ họa rời"] = processedSpecs["Cạc đồ họa rời"].map((v) => {
        const found = LAPTOP_FILTERS["Cạc đồ họa rời"].find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    if (processedSpecs["Kích thước màn hình (inch)"]?.length > 0) {
      // lấy đúng nguồn filter theo category
      const source =
      category === "LAPTOP"
        ? LAPTOP_FILTERS["Kích thước màn hình (inch)"]
        : PHONE_FILTERS["Kích thước màn hình (inch)"];

      processedSpecs["Kích thước màn hình (inch)"] = processedSpecs["Kích thước màn hình (inch)"].map((v) => {
      const found = source.find((opt) => opt.name === v);
      return found ? found.label : v;
      });
    }

    const normalizeSpecs = (filters) => {
    const mapped = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "Cạc đồ họa rời") mapped["GPU"] = value;
      else if (key === "Bộ nhớ") mapped["Storage"] = value;
      else if (key === "Kích thước màn hình (inch)") mapped["ScreenSize"] = value;
      else if (key === "PIN (mAh)") mapped["PIN"] = value;
      else if (key === "Màn Hình") mapped["Screen"] = value;
      else mapped[key] = value;
    });
    return mapped;
  };

  const filters = {
    factories: selectedFactories.map(id => currentFactories.find(b => b.id === id).name),
    product_features: selectedFeatures.map(id => currentFeatures.find(f => f.id === id).id),
    specs: normalizeSpecs(selectedFilters),
      price:
        customPrice.min || customPrice.max
          ? customPrice
          : selectedPrice
          ? {
            min: currentPrices.find((p) => p.id === selectedPrice).range[0],
            max: currentPrices.find((p) => p.id === selectedPrice).range[1],
          }
          : null,
    };

    try {
      const res = await getFilteredProducts(category, filters);
      if (res?.EC === 0 && res?.DT) {
        setProducts(res.DT.products || []);
        setCount(res.DT.count || 0);
      } else {
        setProducts([]);
        setCount(0);
      }
    } catch (err) {
      toast.error("Filter error:", err);
    }
  };

  const handleReset = () => {
    setSelectedFactories([]);
    setSelectedFeatures([]);
    const resetFilters = {};
    Object.keys(currentFilters).forEach((key) => (resetFilters[key] = []));
    setSelectedFilters(resetFilters);
    setSelectedPrice(null);
    setCustomPrice({ min: "", max: "" });
    setProducts(category === "LAPTOP" ? initialLaptops : initialPhones);
    setCount(category === "LAPTOP" ? initialLaptopCount : initialPhoneCount);
  };

  const toggleFactory = (id) => {
    setSelectedFactories((p) => (p.includes(id) ? p.filter((b) => b !== id) : [...p, id]));
  };
  const toggleFeature = (id) => {
    setSelectedFeatures((p) => (p.includes(id) ? p.filter((f) => f !== id) : [...p, id]));
  };

  const handlePriceSelect = (id) => {
    setSelectedPrice((p) => (p === id ? null : id));
    setCustomPrice({ min: "", max: "" });
  };

  const handleClickInputMin = (e) => setCustomPrice({ ...customPrice, min: e.target.value });
  const handleClickInputMax = (e) => setCustomPrice({ ...customPrice, max: e.target.value });

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
        <img src={headers[currentBanner]} alt="Banner" />
      </div>
      <div className="banner-dots external">
          {headers.map((_, i) => (
            <span key={i} className={`dot ${currentBanner === i ? "active" : ""}`} onClick={() => setCurrentBanner(i)}></span>
          ))}
        </div>

      <div className="main-content">
        <div className="filter-section">
          <div className="filter-header">
            <h3>Bộ lọc chi tiết</h3>
            <div className="filter-buttons">
              <button className="btn-filter" onClick={handleFilter}>Lọc</button>
              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </div>

          {/* Hãng */}
          <div className="filter-item">
            <div className="filter-title" onClick={() => toggleSection("brand")}>
              <label>Hãng sản xuất</label>
              {expandedSections.brand ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.brand && (
              <div className="brand-grid">
                {currentFactories.map((brand) => (
                  <div
                    key={brand.id}
                    className={`brand-item ${selectedFactories.includes(brand.id) ? "selected" : ""}`}
                    onClick={() => toggleFactory(brand.id)}
                  >
                    <img src={brand.image} alt={brand.name} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nhu cầu */}
          <div className="filter-item">
            <div className="filter-title" onClick={() => toggleSection("feature")}>
              <label>Nhu cầu sử dụng</label>
              {expandedSections.feature ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.feature && (
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
            )}
          </div>

          {/* Giá */}
          <div className="filter-item">
            <div className="filter-title" onClick={() => toggleSection("price")}>
              <label>Khoảng giá (VNĐ)</label>
              {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.price && (
              <>
                <div className="option-grid">
              {currentPrices.map((p) => {
              const isSelected =
                selectedPrice === p.id ||
                (p.label === "Tất cả" && selectedPrice === null);
              return (
                <div
                  key={p.id}
                  className={`option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handlePriceSelect(p.id)}
                >
                  {p.label}
                </div>
              );
            })}
            </div>

                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={customPrice.min}
                    onChange={(e) => handleClickInputMin(e)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={customPrice.max}
                    onChange={(e) => handleClickInputMax(e)}
                  />
                </div>
              </>
            )}
          </div>

          {/* --- Các phần lọc --- */}
          {filterKeys.map((key) => (
            <div className="filter-item" key={key}>
              <div className="filter-title" onClick={() => toggleSpecSection(key)}>
                <label>{key}</label>
                {expandedSections.specs[key] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.specs[key] && (
                <div className="option-grid">
                  {currentFilters[key].map((option) => {
                    const display = typeof option === "object" ? option.label : option;
                    const value = typeof option === "object" ? option.name : option;
                    const isSelected = key === "CPU" || key === "Cạc đồ họa rời" || key === "Kích thước màn hình (inch)" || key ==="PIN (mAh)"
                      ? selectedFilters[key]?.includes(value) ||
                      (value === null && (!selectedFilters[key] || selectedFilters[key].length === 0))
                      : selectedFilters[key]?.includes(value) ||
                      (value === "Tất cả" && (!selectedFilters[key] || selectedFilters[key].length === 0));
                    return (
                      <div
                        key={value}
                        className={`option-item ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleOption(key, value)}
                      >
                        {display}
                      </div>
                    );
                  })}
                </div>
              )}
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
