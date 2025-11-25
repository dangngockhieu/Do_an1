import axios from '../utils/axiosCustomize';

// ==================== USER API (Admin) ====================

export const getUserWithPaginate = (page, limit, search = "") => {
  const URL_BACKEND = `/user/users-paginate?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
  return axios.get(URL_BACKEND);
};


export const createUserforAdmin = (email, name, password, role) => {
  const URL_BACKEND = '/user/user';
  const data = { email, name, password, role };
  return axios.post(URL_BACKEND, data);
};

export const changeRoleUserforAdmin = (id, role) => {
  const URL_BACKEND = `/user/user-role/${id}`;
  return axios.patch(URL_BACKEND, { role });
};

// ==================== AUTH API ====================
export const register = (email, name, password) => {
  const URL_BACKEND = '/auth/register';
  const data = { email, name, password };
  return axios.post(URL_BACKEND, data);
};

export const login = (email, password) => {
  const URL_BACKEND = '/auth/login';
  const data = { email, password };
  return axios.post(URL_BACKEND, data, { withCredentials: true });
};

export const logout = () => {
  const URL_BACKEND = '/auth/logout';
  return axios.post(URL_BACKEND, {}, { withCredentials: true });
};

export const sendResetPassword = (email) => {
  const URL_BACKEND = '/auth/send-reset-password';
  const data = { email };
  return axios.post(URL_BACKEND, data);
};

export const resetPassword = (email, code, newPassword) => {
  const URL_BACKEND = '/auth/reset-password';
  const data = { email, code, newPassword };
  return axios.post(URL_BACKEND, data);
};

export const changePassword = (oldPassword, newPassword) => {
  const URL_BACKEND = '/user/change-password';
  const data = { oldPassword, newPassword };
  return axios.patch(URL_BACKEND, data);
};

// ==================== PRODUCT API ====================

// Tạo Review cho sản phẩm
export const createReview = (productID, rating, comment, orderItemID) => {
  const URL_BACKEND = `/product/reviews/${productID}`;
  return axios.post(URL_BACKEND, { orderItemID, rating, comment });
};


// Lấy danh sách sản phẩm có phân trang + tìm kiếm
export const getProductsWithPaginate = (page, limit, keyword = "", category, factory) => {
  const URL_BACKEND = `/product/products-paginate?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&factory=${encodeURIComponent(factory)}`;
  return axios.get(URL_BACKEND);
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = (id) => {
  const URL_BACKEND = `/product/products/${id}`;
  return axios.get(URL_BACKEND);
};
// lấy 5 sp laptop bán chạy nhất
export const getTopSellingLaptop = () => {
  const URL_BACKEND = `/product/top-selling-laptop`;
  return axios.get(URL_BACKEND);
};
// lấy 5 sp điện thoại bán chạy nhất
export const getTopSellingPhone = () => {
  const URL_BACKEND = `/product/top-selling-phone`;
  return axios.get(URL_BACKEND);
};

// Lấy 5 sp bán chạy nhất
export const getTopSellingProduct = () => {
  const URL_BACKEND = `/product/top-selling-product`;
  return axios.get(URL_BACKEND);
};

// Lọc sản phẩm
export const getFilteredProducts = async (category, filters) => {
  const URL_BACKEND = `/product/filter-products?category=${category}`;
  return await axios.post(URL_BACKEND, filters);
};

// Thêm nhiều đặc điểm cho sản phẩm
export const addProductFeatures = (productID, featureIDs) => {
  const URL_BACKEND = `/product/product-features/${productID}`;
  return axios.post(URL_BACKEND, { featureIDs });
};

// Xóa đặc điểm của sản phẩm
export const deleteProductFeature = (productID, featureID) => {
  const URL_BACKEND = `/product/product-feature?productID=${productID}&featureID=${featureID}`;
  return axios.delete(URL_BACKEND);
};

// Tạo mới sản phẩm (có ảnh)
export const createProduct = (formData) => {
  const URL_BACKEND = `/product/product`;
  return axios.post(URL_BACKEND, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Cập nhật thông tin sản phẩm (không bao gồm ảnh)
export const updateProduct = (id, data) => {
  const URL_BACKEND = `/product/products/${id}`;
  return axios.put(URL_BACKEND, data);
};

// Thêm nhiều ảnh cho sản phẩm
export const addProductImages = (id, formData) => {
  const URL_BACKEND = `/product/product-images/${id}`;
  return axios.post(URL_BACKEND, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Xóa 1 ảnh
export const deleteProductImage = (imageId) => {
  const URL_BACKEND = `/product/product-image/${imageId}`;
  return axios.delete(URL_BACKEND);
};

// Xóa sản phẩm
export const deleteProduct = (id) => {
  const URL_BACKEND = `/product/products/${id}`;
  return axios.delete(URL_BACKEND);
};

// CART API
export const addProductToCart = (productID) => {
  const URL_BACKEND = `/cart/cart`;
  return axios.post(URL_BACKEND, { productID });
};

export const getNumberCart = () => {
  const URL_BACKEND = `/cart/number-cart`;
  return axios.get(URL_BACKEND);
}
export const getCart = () => {
  const URL_BACKEND = `/cart/cart`;
  return axios.get(URL_BACKEND);
};

export const updateCartQuantity = (productID, newNumber) => {
  const URL_BACKEND = `/cart/cart?productID=${productID}`;
  return axios.patch(URL_BACKEND, { newNumber });
};

export const deleteCartItem = (productID) => {
  const URL_BACKEND = `/cart/cart?productID=${productID}`;
  return axios.delete(URL_BACKEND);
};

export const buyNow = (productID) => {
  const URL_BACKEND = `/cart/buy-now?productID=${productID}`;
  return axios.post(URL_BACKEND);
};

export const checkout = (productID) =>{
  const URL_BACKEND = `/cart/checkout?productID=${productID}`;
  return axios.patch(URL_BACKEND);
};


// ====================== ORDER API  ====================
export const createOrder = (name, address, phone, items, totalPrice, paymentMethod) => {
  const URL_BACKEND = '/order/order';
  const data = { recipientName: name, address: address, phone: phone, items: items, totalPrice: totalPrice, paymentMethod: paymentMethod };
  return axios.post(URL_BACKEND, data);
}

export const getOrderPendingforAdmin = (page, limit) => {
  const URL_BACKEND = `/order/orders/pending?page=${page}&limit=${limit}`;
  return axios.get(URL_BACKEND);
};

export const getOrderforAdmin = (page, limit, status) => {
  const URL_BACKEND = `/order/orders?page=${page}&limit=${limit}&status=${status}`;
  return axios.get(URL_BACKEND);
}

export const getOrderItem = (orderID) => {
  const URL_BACKEND = `/order/orders-item?orderID=${orderID}`;
  return axios.get(URL_BACKEND);
}

export const updatePendingtoShipping = (orderID, trackingCode, expectedDate) => {
  const URL_BACKEND = `/order/order-to-shipping?orderID=${orderID}`;
  return axios.patch(URL_BACKEND, { trackingCode, expectedDate });
}

export const updateOrderforUser = (orderID, status) => {
  const URL_BACKEND = `/order/order?orderID=${orderID}`;
  const data = { status };
  return axios.patch(URL_BACKEND, data);
}

export const getMyOrders = (status) => {
  const URL_BACKEND = `/order/my-orders?status=${status}`; 
  return axios.get(URL_BACKEND);
};

export const buyAgain = (products) => {
  const URL_BACKEND = `/order/buy-again`;
  return axios.post(URL_BACKEND, { products });
}

// ==================== COUNT USERS API (Admin) ====================
export const countUsersforAdmin = () => {
  const URL_BACKEND = '/user/count';
  return axios.get(URL_BACKEND);
};

export const countUsersThisMonthforAdmin = () => {
  const URL_BACKEND = '/user/count-this-month';
  return axios.get(URL_BACKEND);
};

// ==================== COUNT PRODUCTS API (Admin) ====================
export const countProductsforAdmin = () => {
  const URL_BACKEND = '/product/count';
  return axios.get(URL_BACKEND);
};

// ==================== COUNT ORDERS API (Admin) ====================
export const countOrdersthisMonth = () => {
  const URL_BACKEND = '/order/count';
  return axios.get(URL_BACKEND);
};

// ==================== REVENUE THIS MONTH API (Admin) ====================
export const getRevenueThisMonthforAdmin = () => {
  const URL_BACKEND = '/order/revenue-this-month';
  return axios.get(URL_BACKEND);
};

// ==================== REVENUE BY MONTH API (Admin) ====================
export const getRevenueByMonthforAdmin = () => {
  const URL_BACKEND = '/order/revenue-by-month';
  return axios.get(URL_BACKEND);
};

// ==================== VNPay API ====================
export const createVnpayPayment = async (orderID) => {
  const URL_BACKEND = `/vnpay/create`;
  return axios.post(URL_BACKEND, { orderID });
};


