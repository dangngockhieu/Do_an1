import { useLocation } from "react-router-dom";

const ProductDetail = () => {
  const { state } = useLocation();
  const productId = state?.productId;

  if (!product) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <div className="product-detail">
      hello
    </div>
  );
};

export default ProductDetail;
