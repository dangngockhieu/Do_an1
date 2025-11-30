import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { USER_LOGOUT_SUCCESS } from '../../redux/action/userAction';
import {RESET_CART} from "../../redux/action/cartAction";
import { logout } from "../../services/apiServices";
import { toast } from 'react-toastify';
import { BsJustify, BsList } from "react-icons/bs";
const AdminHeader = ({ onToggleCollapse, onToggleMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { account } = useSelector((state) => state.user);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
        await logout(account.email);
    } catch (err) {
        toast.error('Logout request failed');
      }
    dispatch({ type: USER_LOGOUT_SUCCESS });
    dispatch({ type: RESET_CART });
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        {!isMobile && (
          <button className="btn-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
            <BsJustify style={{ justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }} />
          </button>
        )}

        {isMobile && (
          <button className="btn-mobile" onClick={() => onToggleMobile && onToggleMobile()} aria-label="Open mobile menu">
            <BsList size={20} style={{ justifyContent: 'center', alignItems: 'center' }} />
          </button>
        )}

        <span className="header-title">Dashboard</span>
      </div>

      <div className="admin-header__right">
        <span className="admin-user">Xin chào, {account.name || 'Admin'}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default AdminHeader;
