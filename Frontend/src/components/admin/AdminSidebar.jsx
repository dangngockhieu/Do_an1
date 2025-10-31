import { Link } from 'react-router-dom';
import { FaHome, FaUserFriends } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsSkipBackwardFill } from "react-icons/bs";
import { BsFillClipboardMinusFill } from "react-icons/bs";
import { BsBoxSeamFill } from "react-icons/bs";
const AdminSidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile }) => {
  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">Admin</div>
        <button className="mobile-close" onClick={onCloseMobile} aria-label="Close menu">✕</button>
      </div>

      <nav className="nav">
        <Link to="/admin" className="nav-item">
          <span className="icon"><FaHome style={{ color: '#1ea971', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">Dashboard</span>}
        </Link>
        <Link to="/admin/products" className="nav-item">
          <span className="icon"><BsBoxSeamFill style={{ color: "brown" }} /></span>
          {!collapsed && <span className="label">Products</span>}
        </Link>
        <Link to="/admin/orders" className="nav-item">
          <span className="icon"><BsFillClipboardMinusFill style={{ color: '#bebebeff'}} /></span>
          {!collapsed && <span className="label">Orders</span>}
        </Link>
        <Link to="/admin/users" className="nav-item">
          <span className="icon"><FaUserFriends style={{ color: 'purple', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">Users</span>}
        </Link>
        <Link to="/admin/settings" className="nav-item">
          <span className="icon"><IoSettings style={{ color: '#a39d9dff', fontSize: '1.2rem' }} /></span>
          {!collapsed && <span className="label">Settings</span>}
        </Link>
        <Link to="/" className="nav-item">
          <span className="icon"><BsSkipBackwardFill style={{ color: '#b1d960ff' }} /></span>
          {!collapsed && <span className="label">Trang chủ</span>}
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
