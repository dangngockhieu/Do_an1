import { useEffect, useState } from "react";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BsFillPencilFill, BsFillCameraFill, BsArrowRightCircleFill } from "react-icons/bs";
import { FaPlus, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
import ProductDetail from "./ProductDetail";
import ProductDelete from "./ProductDelete";
import { getProductsWithPaginate, deleteProduct } from "../../../services/apiServices";
import "./ManageProduct.scss";

const ManageProduct = () => {
  const LIMIT = 7;
  const [products, setProducts] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("LAPTOP");
  const [factoryFilter, setFactoryFilter] = useState("ALL");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async (page = 1, keyword = "", category = "LAPTOP", factory = "ALL") => {
    setLoading(true);
    try {
      const res = await getProductsWithPaginate(page, LIMIT, keyword, category, factory);
      if (res && res.EC === 0) {
        setProducts(res.DT.products || []);
        setPageCount(Math.ceil((res.DT.total || 0) / LIMIT));
      } else {
        setProducts([]);
        toast.error(res?.EM || "Không tải được danh sách sản phẩm");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm, categoryFilter, factoryFilter);
  }, [currentPage, categoryFilter, factoryFilter]);

  useEffect(() => {
    setFactoryFilter("ALL"); 
    setCurrentPage(1);
  }, [categoryFilter]);

  // ================= SEARCH =================
  const handleSearchSubmit = async () => {
    setIsSearching(true);
    setCurrentPage(1);
    await fetchProducts(1, searchTerm, categoryFilter);
  };

  const handleClearSearch = async () => {
    setSearchTerm("");
    setIsSearching(false);
    setCurrentPage(1);
    await fetchProducts(1, "", categoryFilter);
  };

  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setCurrentPage(newPage);
  };

  // ================= MODAL HANDLING =================
  const handleOpenModal = (type, product = null) => {
    setSelectedProduct(product);
    if (type === "add") setShowAdd(true);
    if (type === "edit") setShowEdit(true);
    if (type === "detail") setShowDetail(true);
    if (type === "delete") setShowDelete(true);
  };

  const handleCloseAll = () => {
    setShowAdd(false);
    setShowEdit(false);
    setShowDetail(false);
    setShowDelete(false);
    setSelectedProduct(null);
  };

  // ================= DELETE =================
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      const res = await deleteProduct(selectedProduct.id);
      if (res && res.EC === 0) {
        toast.success("Đã xóa sản phẩm");
        fetchProducts(currentPage, searchTerm, categoryFilter);
      } else {
        toast.error(res?.EM || "Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      handleCloseAll();
    }
  };

  // ================= UI =================
  return (
    <div className="manage-product-container">
      <div className="manage-header">
        <div className="title">Quản lý sản phẩm</div>
        <div className="manage-actions">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="LAPTOP">Laptop</option>
            <option value="PHONE">Điện thoại</option>
          </select>

          {categoryFilter === 'LAPTOP' && (
            <select
              value={factoryFilter}
              onChange={(e) => {
                setFactoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Tất cả</option>
              <option value="DELL">DELL</option>
              <option value="ACER">ACER</option>
              <option value="MSI">MSI</option>
              <option value="LENOVO">LENOVO</option>
              <option value="HP">HP</option>
              <option value="ASUS">ASUS</option>
              <option value="MACBOOK">MACBOOK</option>
            </select>
          )}

          {categoryFilter === 'PHONE' && (
            <select
              value={factoryFilter}
              onChange={(e) => {
                setFactoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Tất cả</option>
              <option value="IPHONE">IPHONE</option>
              <option value="SAMSUNG">SAMSUNG</option>
              <option value="OPPO">OPPO</option>
              <option value="VIVO">VIVO</option>
              <option value="XIAOMI">XIAOMI</option>
              <option value="REALME">REALME</option>
              <option value="HONOR">HONOR</option>
            </select>
          )}

          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            />
            {isSearching && searchTerm ? (
              <button className="search-clear-btn" onClick={handleClearSearch}>
                <IoMdClose className="clear-icon" />
              </button>
            ) : (
              <button className="search-icon-btn" onClick={handleSearchSubmit}>
                <FaSearch className="search-icon" />
              </button>
            )}
          </div>

          <button className="btn-add" onClick={() => handleOpenModal("add")}>
            <FaPlus /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="product-table">
        {loading ? (
          <div className="no-data">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="no-data">Không có sản phẩm</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Số lượng</th>
                <th>Đã bán</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * LIMIT + index + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.sold}</td>
                  <td className="actions">
                    <button
                      className="btn-view"
                      onClick={() => handleOpenModal("detail", p)}
                    >
                      <BsFillCameraFill style={{ fontSize: '1.1rem' }} />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenModal("edit", p)}
                    >
                      <BsFillPencilFill style={{ fontSize: '1.1rem' }} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleOpenModal("delete", p)}
                    >
                      <RiDeleteBin6Fill style={{ fontSize: '1.1rem' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ReactPaginate
        nextLabel={<BsArrowRightCircleFill style={{ fontSize: "1.5rem" }} />}
        previousLabel={
          <BsArrowRightCircleFill
            style={{ fontSize: "1.5rem", transform: "scaleX(-1)" }}
          />
        }
        onPageChange={handlePageClick}
        pageCount={pageCount}
        forcePage={currentPage - 1}
        containerClassName="pagination"
        activeClassName="active"
      />

      {/* ===== MODALS ===== */}
      <ProductAdd
        show={showAdd}
        setShow={setShowAdd}
        onRefresh={() => fetchProducts(currentPage, searchTerm, categoryFilter)}
      />

      {selectedProduct && (
        <>
          <ProductEdit
            show={showEdit}
            setShow={setShowEdit}
            product={selectedProduct}
            onRefresh={() => fetchProducts(currentPage, searchTerm, categoryFilter)}
          />
          <ProductDetail
            show={showDetail}
            setShow={setShowDetail}
            product={selectedProduct}
            onRefresh={() => fetchProducts(currentPage, searchTerm, categoryFilter)}
          />
          <ProductDelete
            show={showDelete}
            setShow={setShowDelete}
            product={selectedProduct}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default ManageProduct;
