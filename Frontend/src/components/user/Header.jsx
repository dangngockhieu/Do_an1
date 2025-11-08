import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaUserCircle, FaMapMarkerAlt } from "react-icons/fa";
import { BsCartPlusFill, BsEnvelopeFill, BsCaretDownFill } from "react-icons/bs";
import { USER_LOGOUT_SUCCESS } from "../../redux/action/userAction";
import { logout } from "../../services/apiServices";
import { useNavigate } from "react-router-dom";
import "./Header.scss";
import ChangePassword from './ChangePassword';
import { NavLink, Link } from "react-router-dom";
import { setCartCount } from "../../redux/action/cartAction";
import { getNumberCart} from "../../services/apiServices";
import { toast } from "react-toastify";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSelector((state) => state.user);
  const numberCart = useSelector((state) => state.cart.count);

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

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getNumberCart();
        if (res?.EC === 0) {
          dispatch(setCartCount(res.DT));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCart();
  }, [dispatch]);


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

  const handleOpenCart = () => {
    if(isAuthenticated){
      navigate('/cart');
    }
    else{
      toast.info("Vui lòng đăng nhập để xem giỏ hàng");
    }
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
            <span>
              <BsEnvelopeFill className="icon" />{" "}
              <span className="top-text">laptopshop8386@gmail.com</span>
            </span>
          </div>
          <div className="header__top-right">
            <Link to="#">Điều khoản sử dụng</Link> / <Link to="#">Hỗ trợ</Link>
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
          <button className="icon-btn cart left" onClick={handleOpenCart}>
            <BsCartPlusFill />
            <span className="badge">{numberCart ?? 0}</span>
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
                  <Link to="/login" onClick={() => setShowMenu(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setShowMenu(false)}>
                    Đăng ký
                  </Link>
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


