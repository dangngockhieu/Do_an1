import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ResetPassword from "./pages/resetPassword.jsx";
import Homepage from './components/user/Homepage.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminRoute from './pages/admin.private.route.jsx';
import NotFound from './pages/error.jsx';
import LandingPage from './components/user/LandingPage.jsx';
import Product from './components/user/Product.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ManagerUser from './components/admin/ManageUser/ManagerUser.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'product', element: <Product /> },
    ],
    errorElement: <NotFound />,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <div>All Products</div> },
      { path: 'orders', element: <div>All Orders</div> },
      { path: 'users', element: <ManagerUser /> },
      { path: 'settings', element: <div>All Settings</div> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/register', element: <Register /> },
]);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </PersistGate>
      </Provider>
    </StrictMode>
  );
}
