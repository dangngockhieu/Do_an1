import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { decrementCart } from "../../../redux/action/cartAction";
import { getCart, updateCartQuantity, deleteCartItem, checkout } from "../../../services/apiServices";
import "./CartPage.scss";
import { toast } from "react-toastify";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const selectedItemsRef = useRef(selectedItems);
  const confirmedQuantities = useRef({});

  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        if (res?.EC === 0) {
          const items = res.DT || [];
          setCartItems(items);

          const initiallySelected = [];

          items.forEach(item => {
            confirmedQuantities.current[item.id] = item.number;
            if (item.isSelected && item.quantity > 0) {
              initiallySelected.push(item.id);
            }
          });

          setSelectedItems(initiallySelected);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const handleCheckoutOnUnmount = async (idsToCheckout) => {
      if (idsToCheckout.length === 0) return;

      for (const id of idsToCheckout) {
        await checkout(id);
      }
    };

    return () => {
      const idsToCheckout = selectedItemsRef.current;

      handleCheckoutOnUnmount(idsToCheckout);
    };
  }, []);

  const syncQuantityToServer = useCallback(async (productId, newNumber) => {
    if (confirmedQuantities.current[productId] !== newNumber) {
      try {
        const res = await updateCartQuantity(productId, newNumber);

        if (res?.EC === 0) {
          confirmedQuantities.current[productId] = newNumber;
        } else {
          const confirmedNumber = res.DT?.confirmedNumber || confirmedQuantities.current[productId];

          toast.error(`Lỗi cập nhật giỏ hàng: ${res?.EM || 'Lỗi không xác định'}`);
          setCartItems(prev => prev.map(item =>
            item.id === productId
              ? { ...item, number: confirmedNumber }
              : item
          ));
          confirmedQuantities.current[productId] = confirmedNumber;
        }
      } catch (error) {
        toast.error("Lỗi kết nối. Đang hoàn lại số lượng cũ.");
        // ROLLBACK khi lỗi kết nối
        setCartItems(prev => prev.map(item =>
          item.id === productId
            ? { ...item, number: confirmedQuantities.current[productId] }
            : item
        ));
      }
    }
  }, []);

  // Sử dụng Debounce cho hàm gọi API (700ms)
  const debouncedSync = useDebounce(syncQuantityToServer, 700);


  const total = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((acc, item) => acc + item.price * item.number, 0);

  // Cập nhật số lượng trên UI 
  const updateQuantity = (id, newNumber) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, number: newNumber } : item
      )
    );
    debouncedSync(id, newNumber);
  };

  const handleIncrease = (id) => {
    const currentItem = cartItems.find(item => item.id === id);
    if (currentItem) {
      updateQuantity(id, currentItem.number + 1);
    }
  };

  const handleDecrease = (id) => {
    const currentItem = cartItems.find(item => item.id === id);
    if (currentItem && currentItem.number > 1) {
      updateQuantity(id, currentItem.number - 1);
    }
  };

  // Chỉ toggle trạng thái chọn 
  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteCartItem(id);

      if (res?.EC === 0) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => prev.filter((x) => x !== id));
        dispatch(decrementCart());
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng thành công!");
      } else {
        toast.error(`Lỗi xóa sản phẩm: ${res?.EM || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi deleteCartItem:", error);
    }
  };

  // HÀM XỬ LÝ CHECKOUT 
  const handleCheckout = () => {

    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));

    const checkoutData = selectedCartItems.map(item => ({
      id: item.id,
      number: item.number,
      price: item.price,
      name: item.name,
      imageUrl: item.imageUrl
    }));
    navigate('/checkout', {
      state: {
        checkoutItems: checkoutData,
        totalAmount: total,
      }
    });
  };

  return (
    <div className="cart-page">
      <div className="cart-left">
        <div className="cart-select-all">
          <input
            type="checkbox"
            checked={
              selectedItems.length === cartItems.length && cartItems.length > 0
            }
            onChange={handleSelectAll}
          />
          <span>Chọn tất cả ({selectedItems.length})</span>
        </div>

        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelect(item.id)}
              disabled={item.quantity === 0}
            />
            <img src={`${BASE_URL}${item.imageUrl}`} alt={item.name} />
            <div className="cart-info">
              <div className="product-text-info">
                <h4>{item.name}</h4>
                {item.quantity > 0 ? (
                  <div className="cart-price">
                    <span className="current">
                      {item.price.toLocaleString()}₫
                    </span>
                    {item.originalPrice && (
                      <span className="old">
                        {item.originalPrice.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="cart-price">
                    <span className="out-of-stock">Hết hàng</span>
                  </div>
                )}
              </div>

              <div className="cart-actions">
                <div className="quantity-control">
                  <button
                    onClick={() => handleDecrease(item.id)}
                    disabled={item.number <= 1 || item.quantity === 0}
                  >
                    -
                  </button>
                  <span>{item.number}</span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    disabled={item.quantity === 0}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button className="delete-btn" onClick={() => handleDelete(item.id)}>
              <RiDeleteBin6Fill style={{ fontSize: "1.5rem" }} />
            </button>
          </div>
        ))}
      </div>

      <div className="cart-right">
        <h3>Thông tin đơn hàng</h3>
        <div className="summary-row">
          <span>Tổng tiền</span>
          <strong>{total.toLocaleString()}₫</strong>
        </div>
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          Xác nhận đơn hàng
        </button>
      </div>
    </div>
  );
};

export default CartPage;