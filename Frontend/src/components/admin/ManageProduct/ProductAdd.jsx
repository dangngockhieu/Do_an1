import { useState, useRef } from "react";
import { createProduct } from "../../../services/apiServices";
import { toast } from "react-toastify";
import "./ProductAdd.scss";

const BASE_URL = import.meta.env.VITE_BACKEND || "http://localhost:8080";

const ProductAdd = ({ show, setShow, onRefresh }) => {
  const [form, setForm] = useState({
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
  });

  const [images, setImages] = useState([]); // File objects
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null); // 👈 để thao tác với input file

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const removePreview = (index) => {
    const newFiles = [...images];
    const newPreview = [...previewUrls];

    // Hủy URL preview
    URL.revokeObjectURL(newPreview[index]);
    newFiles.splice(index, 1);
    newPreview.splice(index, 1);

    setImages(newFiles);
    setPreviewUrls(newPreview);

    //  Cập nhật lại input file theo danh sách còn lại
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }

    //  Nếu không còn ảnh nào, reset hoàn toàn
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
        onRefresh();

        // cleanup previews
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setForm({
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
        });
        setImages([]);
        setPreviewUrls([]);

        //  reset input file
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
        <form onSubmit={handleSubmit}>
          {Object.entries({
            name: "Tên sản phẩm",
            originalPrice: "Giá gốc",
            coupon: "Giảm giá (%)",
            quantity: "Số lượng",
            infor: "Thông tin",
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
            key === "infor" ? (
              <textarea
                key={key}
                name={key}
                placeholder={label}
                value={form[key]}
                onChange={handleChange}
                className={errors[key] ? "error" : ""}
                rows={4}
              />
            ) : (
              <input
                key={key}
                name={key}
                placeholder={label}
                value={form[key]}
                onChange={handleChange}
                className={errors[key] ? "error" : ""}
              />
            )
          )}

          <div className="select-row">
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="" disabled>
                -- Chọn danh mục --
              </option>
              <option value="LAPTOP">Laptop</option>
              <option value="PHONE">Điện thoại</option>
            </select>

            <select name="factory" value={form.factory} onChange={handleChange}>
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
              <option value="IPHONE">IPHONE</option>
              <option value="SAMSUNG">SAMSUNG</option>
            </select>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

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

          <div className="modal-actions">
            <button type="button" onClick={() => setShow(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAdd;
