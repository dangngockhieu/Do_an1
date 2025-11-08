import { Routes, Route } from 'react-router-dom';

import Homepage from './components/user/Homepage.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminRoute from './pages/admin.private.route.jsx';
import NotFound from './pages/error.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ResetPassword from "./pages/resetPassword.jsx";

import LandingPage from './components/user/LandingPage.jsx';
import Product from './components/user/Product.jsx';
import ProductDetail from './components/user/ProductDetail.jsx';
import CartPage from './components/user/CartPage.jsx';

import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ManageProduct from './components/admin/ManageProduct/ManageProduct.jsx';
import ManagerUser from './components/admin/ManageUser/ManagerUser.jsx';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} errorElement={<NotFound />}>
        <Route index element={<LandingPage />} />
        <Route path="product" element={<Product />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<CartPage />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ManageProduct />} />
        <Route path="orders" element={<div>All Orders</div>} />
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