import { Routes, Route } from 'react-router-dom';

import Homepage from './components/user/Homepage.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminRoute from './pages/admin.private.route.jsx';
import PrivateRoute from './pages/private.route.jsx';
import NotFound from './pages/error.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ResetPassword from "./pages/resetPassword.jsx";

import LandingPage from './components/user/Product/LandingPage.jsx';
import Product from './components/user/Product/Product.jsx';
import ProductDetail from './components/user/Product/ProductDetail.jsx';
import CartPage from './components/user/Cart-Checkout/CartPage.jsx';
import Checkout from './components/user/Cart-Checkout/CheckOut.jsx';

import ManageProduct from './components/admin/ManageProduct/ManageProduct.jsx';
import ManagerUser from './components/admin/ManageUser/ManagerUser.jsx';
import ManageOrder from './components/admin/ManageOrder/ManageOrder.jsx';
import Dashboard from './components/admin/DashBoard/DashBoard.jsx';
import OrderHistory from './components/user/Order/OrderHistory.jsx';

import Warranty from './components/term/Warranty.jsx';
import Privacy from './components/term/Privacy.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} errorElement={<NotFound />}>
        <Route index element={<LandingPage />} />
        <Route path="product" element={<Product />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        <Route path="warranty" element={<Warranty />} />
        <Route path="privacy" element={<Privacy />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ManageProduct />} />
        <Route path="orders" element={<ManageOrder />} />
        <Route path="users" element={<ManagerUser />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;