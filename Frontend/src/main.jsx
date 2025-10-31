import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ResetPassword from "./pages/resetPassword.jsx";
import Homepage from './components/user/Homepage.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminRoute from './pages/admin.private.route.jsx';
// import PrivateRoute from './pages/private.route.jsx';
import NotFound from './pages/error.jsx';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ManagerUser from './components/admin/ManageUser/ManagerUser.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <NotFound />,
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: "products",
      element: <div>All Products</div>,
    },
    {
      path: "orders",
      element: <div>All Orders</div>,
    },
    {
      path: "users",
      element: <ManagerUser />,
    }
    ,
    {
      path: "settings",
      element: <div>All Settings</div>,
    }
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/register",
    element: <Register />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Provider>
  </StrictMode>,
)
