import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaUserCircle, FaMapMarkerAlt } from "react-icons/fa";
import { BsCartPlusFill, BsEnvelopeFill } from "react-icons/bs";
import { USER_LOGOUT_SUCCESS } from "../../redux/action/userAction";
import { logout } from "../../services/apiServices";
import { BsCaretDownFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import "./Header.scss";
import ChangePassword from './ChangePassword';
import { NavLink } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSelector((state) => state.user);

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const menuRef = useRef(null);

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async() => {
      try {
        await logout(account.email);
      } catch (err) {
        
        console.error('Logout request failed', err);
      }
      dispatch({ type: USER_LOGOUT_SUCCESS });
      setShowMenu(false);
      navigate('/login');
  };

  return (
    <header className="header">
      {/* ===== TOP BAR ===== */}
      <div className="header__top">
        <div className="header__top-container">
          <div className="header__top-left">
            <span>
              <FaMapMarkerAlt className="icon" />{" "}
              <span className="top-text">Hồ Chí Minh</span>
            </span>
            <a href="mailto:laptopshop8386@gmail.com">
              <BsEnvelopeFill className="icon" />{" "}
              <span className="top-text">laptopshop8386@gmail.com</span>
            </a>
          </div>
          <div className="header__top-right">
            <a href="#">Điều khoản sử dụng</a> / <a href="#">Hỗ trợ</a>
          </div>
        </div>
      </div>

      {/* ===== NAVBAR ===== */}
      <div className="header__nav">
        <div className="header__logo">
          <h2>
            <span>Tech</span>Zone
          </h2>
        </div>

        <div className="header__menu">
          <NavLink to="/" className="nav-item">
            Trang chủ
          </NavLink>
          <NavLink to="/product" className="nav-item">
            Sản phẩm
          </NavLink>
        </div>

        <div className="header__icons" ref={menuRef}>
          <button className="icon-btn cart left">
            <BsCartPlusFill />
            <span className="badge">0</span>
          </button>

          {/* Nút user */}
          <button
            className="icon-btn"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <FaUserCircle />
          </button>

          {showMenu && (
            <div className="user-menu">
              {!isAuthenticated ? (
                <>
                  <a href="/login" onClick={() => setShowMenu(false)}>
                    Đăng nhập
                  </a>
                  <a href="/register" onClick={() => setShowMenu(false)}>
                    Đăng ký
                  </a>
                </>
              ) : (
                <>
                  <span className="user-name">Xin chào, {account.name}</span>
                  <div className="setting-menu">
                    <button className="setting-btn" onClick={() => setShowSettings((prev) => !prev)}>
                      Cài đặt <BsCaretDownFill className={`${showSettings ? 'dropdown-icon1' : 'dropdown-icon2'}`} />
                    </button>
                    {showSettings && (
                      <div className="setting-dropdown">
                        <button className="link-btn" onClick={() => { setShowMenu(false); setShowSettings(false); setShowChangePassword(true); }}>- Đổi mật khẩu</button>
                        {account.role === 'ADMIN' && (
                          <button className="link-btn" onClick={() => { setShowMenu(false); setShowSettings(false); navigate('/admin'); }}>- Trang quản trị</button>
                        )}
                      </div>
                    )}
                  </div>


                  <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </header>
  );
};

export default Header;


