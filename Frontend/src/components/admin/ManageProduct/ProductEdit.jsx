import { useState, useEffect } from "react";
import {
  updateProduct,
  addProductImages,
  deleteProductImage,
} from "../../../services/apiServices";
import { toast } from "react-toastify";
import "./ProductEdit.scss";

const BASE_URL = import.meta.env.VITE_BACKEND || "http://localhost:8080";

const ProductEdit = ({ show, setShow, product, onRefresh }) => {
  const [form, setForm] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [zoomImg, setZoomImg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setForm({
      name: product?.name || "",
      originalPrice: product?.originalPrice || "",
      coupon: product?.coupon || "",
      quantity: product?.quantity || "",
      infor: product?.infor || "",
      warranty: product?.warranty || "",
      cpu: product?.cpu || "",
      ram: product?.ram || "",
      storage: product?.storage || "",
      screen: product?.screen || "",
      graphicsCard: product?.graphicsCard || "",
      battery: product?.battery || "",
      weight: product?.weight || "",
      releaseYear: product?.releaseYear || "",
      category: product?.category || "",
      factory: product?.factory || "",
    });
    setExistingImages(product?.images || []);
    setNewFiles([]);
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const removeNewPreview = (idx) => {
    const nfiles = [...newFiles];
    const npre = [...previewUrls];
    URL.revokeObjectURL(npre[idx]);
    nfiles.splice(idx, 1);
    npre.splice(idx, 1);
    setNewFiles(nfiles);
    setPreviewUrls(npre);
  };

  const handleDeleteExistingImage = (imageId) => setConfirmDelete(imageId);

  const confirmDeleteImage = async () => {
    if (!confirmDelete) return;
    try {
      const res = await deleteProductImage(confirmDelete);
      if (res && res.EC === 0) {
        toast.success("Đã xóa ảnh");
        setExistingImages((prev) => prev.filter((i) => i.id !== confirmDelete));
      } else toast.error(res?.EM || "Xóa ảnh thất bại");
    } catch {
      toast.error("Lỗi khi xóa ảnh");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resUpdate = await updateProduct(product.id, form);
      if (!(resUpdate && resUpdate.EC === 0)) {
        toast.error(resUpdate?.EM || "Cập nhật thất bại");
        return;
      }

      if (newFiles.length > 0) {
        const fd = new FormData();
        newFiles.forEach((f) => fd.append("images", f));
        const resAdd = await addProductImages(product.id, fd);
        if (!(resAdd && resAdd.EC === 0)) {
          toast.error(resAdd?.EM || "Upload ảnh thất bại");
          return;
        }
      }

      toast.success("Cập nhật sản phẩm thành công!");
      onRefresh();
      setShow(false);
    } catch {
      toast.error("Lỗi khi cập nhật sản phẩm");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h4>Cập nhật sản phẩm</h4>

        {/* FORM CHÍNH */}
        <form className="form-edit-product">
          {[
            { name: "name", label: "Tên sản phẩm" },
            { name: "originalPrice", label: "Giá ban đầu" },
            { name: "coupon", label: "Giảm giá (%)" },
            { name: "quantity", label: "Số lượng" },
            { name: "warranty", label: "Bảo hành" },
            { name: "cpu", label: "CPU" },
            { name: "ram", label: "RAM" },
            { name: "storage", label: "Bộ nhớ" },
            { name: "screen", label: "Màn hình" },
            { name: "graphicsCard", label: "Card đồ họa" },
            { name: "battery", label: "Pin" },
            { name: "weight", label: "Trọng lượng" },
            { name: "releaseYear", label: "Năm phát hành" },
          ].map(({ name, label }) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={label}
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="infor">Thông tin thêm</label>
            <textarea
              id="infor"
              name="infor"
              value={form.infor}
              onChange={handleChange}
              placeholder="Thông tin thêm"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="LAPTOP">Laptop</option>
                <option value="PHONE">Điện thoại</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="factory">Nhà sản xuất</label>
              <select
                id="factory"
                name="factory"
                value={form.factory}
                onChange={handleChange}
              >
                <option value="">-- Chọn hãng --</option>
                <option value="DELL">Dell</option>
                <option value="ACER">Acer</option>
                <option value="MSI">MSI</option>
                <option value="LENOVO">Lenovo</option>
                <option value="HP">HP</option>
                <option value="ASUS">Asus</option>
                <option value="GIGABYTE">Gigabyte</option>
                <option value="MACBOOK">Macbook</option>
                <option value="IPHONE">iPhone</option>
                <option value="SAMSUNG">Samsung</option>
                <option value="XIAOMI">Xiaomi</option>
                <option value="OPPO">Oppo</option>
                <option value="REALME">Realme</option>
                <option value="VIVO">Vivo</option>
              </select>
            </div>
          </div>
        </form>

        {/* PHẦN ẢNH */}
        <div className="edit-images">
          <div className="existing-images">
            <h5>Ảnh hiện có</h5>
            <div className="image-row">
              {existingImages?.length ? (
                existingImages.map((img) => (
                  <div key={img.id} className="image-item">
                    <img
                      src={`${BASE_URL}${img.url}`}
                      alt={`img-${img.id}`}
                      onClick={() => setZoomImg(`${BASE_URL}${img.url}`)}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                    >
                      X
                    </button>
                  </div>
                ))
              ) : (
                <p>Không có ảnh</p>
              )}
            </div>
          </div>

          <div className="add-new-images">
            <h5>Thêm ảnh mới</h5>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewUrls.length > 0 && (
              <div className="image-row">
                {previewUrls.map((p, i) => (
                  <div className="image-item" key={i}>
                    <img src={p} alt={`preview-${i}`} />
                    <button type="button" onClick={() => removeNewPreview(i)}>
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NÚT DƯỚI CÙNG */}
        <div className="modal-actions bottom">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShow(false)}
          >
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            Lưu thay đổi
          </button>
        </div>
      </div>

      {zoomImg && (
        <div className="zoom-overlay" onClick={() => setZoomImg(null)}>
          <img src={zoomImg} alt="zoomed" className="zoomed-img" />
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Bạn có chắc muốn xóa ảnh này không?</p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Hủy
              </button>
              <button className="btn-confirm" onClick={confirmDeleteImage}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEdit;
