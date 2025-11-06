import { useState, useRef, useEffect } from "react";
import { createProduct, addProductImages } from "../../../services/apiServices";
import { toast } from "react-toastify";
import "./ProductAdd.scss";
// Danh sách feature có id + name
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
const ProductAdd = ({ show, setShow, onRefresh }) => {
  
  const initForm = {
    name: "",
    originalPrice: "",
    coupon: "",
    quantity: "",
    infor: "",
    warranty: "",
    cpu: "",
    ram: "",
    storage: "",
    screen: "",
    graphicsCard: "",
    battery: "",
    weight: "",
    releaseYear: "",
    category: "",
    factory: "",
  };
  const [form, setForm] = useState(initForm);

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [tempFeatures, setTempFeatures] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
        let newForm = { ...prev, [name]: value }; 
        if (name === 'category') {
            newForm.factory = "";
        }
        return newForm;
    });
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const allFiles = [...images, ...files];
    setImages(allFiles);
    const urls = allFiles.map((f) => URL.createObjectURL(f));
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(urls);
    e.target.value = null;
  };
  const handleClose = () => {
    setShow(false);
    setImages([]);
    setForm(initForm);
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
    setTempFeatures([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

//  Toggle feature theo ID
  const toggleFeature = (id) => {
    setTempFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const removePreview = (index) => {
    const newFiles = [...images];
    const newPreview = [...previewUrls];
    URL.revokeObjectURL(newPreview[index]);
    newFiles.splice(index, 1);
    newPreview.splice(index, 1);

    setImages(newFiles);
    setPreviewUrls(newPreview);

    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }

    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const required = [
      "name",
      "originalPrice",
      "quantity",
      "warranty",
      "cpu",
      "ram",
      "storage",
      "battery",
      "releaseYear",
      "category",
      "factory",
    ];
    const newErr = {};
    required.forEach((key) => {
      if (!form[key]) newErr[key] = true;
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      images.forEach((img) => fd.append("images", img));

      const res = await createProduct(fd);
      if (res && res.EC === 0) {
        toast.success("Thêm sản phẩm thành công!");
        if (tempFeatures.length > 0) await addProductFeatures(res.DT.id, tempFeatures);
        onRefresh();
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setForm(initForm);
        setImages([]);
        setPreviewUrls([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShow(false);
      } else toast.error(res?.EM || "Thêm thất bại");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thêm sản phẩm");
    }
  };



  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h4>Thêm sản phẩm mới</h4>
        <form onSubmit={handleSubmit} className="form-add-product">
          {Object.entries({
            name: "Tên sản phẩm",
            originalPrice: "Giá gốc",
            coupon: "Giảm giá (%)",
            quantity: "Số lượng",
            warranty: "Bảo hành",
            cpu: "CPU",
            ram: "RAM",
            storage: "Bộ nhớ",
            screen: "Màn hình",
            graphicsCard: "Card đồ họa",
            battery: "Pin",
            weight: "Trọng lượng",
            releaseYear: "Năm phát hành",
          }).map(([key, label]) =>
            key === "infor" ? null : (
              <div className="form-group" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  placeholder={label}
                  className={errors[key] ? "error" : ""}
                />
              </div>
            )
          )}

          <div className="form-group">
            <label htmlFor="infor">Thông tin thêm</label>
            <textarea
              id="infor"
              name="infor"
              value={form.infor}
              onChange={handleChange}
              placeholder="Thông tin sản phẩm..."
              className={errors.infor ? "error" : ""}
              rows={4}
            />
          </div>

          <div className="select-row">
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="" disabled>
                  -- Chọn danh mục --
                </option>
                <option value="LAPTOP">Laptop</option>
                <option value="PHONE">Điện thoại</option>
              </select>
            </div>
            {form.category === "LAPTOP" && (
              <div className="form-group">
              <label htmlFor="factory">Nhà sản xuất</label>
              <select
                id="factory"
                name="factory"
                value={form.factory}
                onChange={handleChange}
              >
                <option value="" disabled>
                  -- Chọn nhà sản xuất --
                </option>
                <option value="DELL">DELL</option>
                <option value="ACER">ACER</option>
                <option value="MSI">MSI</option>
                <option value="LENOVO">LENOVO</option>
                <option value="HP">HP</option>
                <option value="ASUS">ASUS</option>
                <option value="MACBOOK">MACBOOK</option>
              </select>
            </div>
            )}

            {form.category === "PHONE" && (
              <div className="form-group">
              <label htmlFor="factory">Nhà sản xuất</label>
              <select
                id="factory"
                name="factory"
                value={form.factory}
                onChange={handleChange}
              >
                <option value="" disabled>
                  -- Chọn nhà sản xuất --
                </option>
                <option value="IPHONE">IPHONE</option>
                <option value="SAMSUNG">SAMSUNG</option>
                <option value="OPPO">OPPO</option>
                <option value="VIVO">VIVO</option>
                <option value="XIAOMI">XIAOMI</option>
                <option value="REALME">REALME</option>
                <option value="HONOR">HONOR</option>
              </select>
            </div>
            )}
          </div>
          {form.category && (
          <div className="features-section">
            <h5>Nhu cầu sử dụng</h5>
            <div className="feature-list">
              {(form.category === "LAPTOP"
                ? FEATURE_NAMES.slice(0, 6)
                : form.category === "PHONE"
                ? FEATURE_NAMES.slice(6)
                : FEATURE_NAMES
              ).map((f) => (
              <div key={f.id}
                className={`feature-item ${
                tempFeatures.includes(f.id) ? "selected" : ""
                }`}
                onClick={() => toggleFeature(f.id)}
              >
          {f.name}
        </div>
      ))}
    </div>
  </div>
)}

          {previewUrls.length > 0 && (
            <div className="preview-row">
              {previewUrls.map((url, i) => (
                <div key={i} className="preview-item">
                  <img src={url} alt={`preview-${i}`} />
                  <button type="button" onClick={() => removePreview(i)}>
                    X
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions bottom">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleClose()}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAdd;
