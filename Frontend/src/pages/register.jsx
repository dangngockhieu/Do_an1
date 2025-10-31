import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import "./register.scss";
import { Link } from "react-router-dom";
import { register } from "../services/apiServices";
import { FaGift } from "react-icons/fa6";
import { FaRegCreditCard } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";
import { toast } from "react-toastify";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    // Kiểm tra dữ liệu đầu vào
    if (!email || !name || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (isLoading) return; 
    setIsLoading(true);

    try {
      const res = await register(email, name, password);

      if (res && (res.errors || res.error)) {
        const msg = res.errors
          ? Object.values(res.errors).join(", ")
          : res.error;
        toast.error(msg);
      } else {
        toast.success(
          "Đăng ký thành công! Vui lòng xác thực email trong vòng 30 phút."
        );
        // reset form sau khi đăng ký
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Đã có lỗi xảy ra";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-wrap">
      <div className="register-card">
        {/* Panel giới thiệu */}
        <aside className="register-card__info">
          <div className="brand">
            <i className="fa-solid fa-mobile-screen-button"></i>
            <h3>TechZone</h3>
          </div>
          <p>
            Tạo tài khoản để nhận được những ưu đãi độc quyền và trải nghiệm mua
            sắm tuyệt vời nhất.
          </p>

          <ul className="benefits">
            <li><FaGift style={{ color: "#a91e7bff" }} /> Ưu đãi đặc biệt cho thành viên mới</li>
            <li><FaRegCreditCard style={{ color: "#1b1b22ff" }} /> Thanh toán nhanh chóng, bảo mật</li>
            <li><BsBoxSeamFill style={{ color: "brown" }} /> Theo dõi đơn hàng dễ dàng</li>
          </ul>
        </aside>

        {/* Form đăng ký */}
        <main className="register-card__form">
          <header className="form-header">
            <h2>Tạo tài khoản</h2>
            <p>Đăng ký để bắt đầu mua sắm ngay hôm nay</p>
          </header>

          <form onSubmit={handleRegister} className="form">
            {/* Email */}
            <label className="field">
              <span>Địa chỉ Email</span>
              <div className="field__input">
                <i className="fa-regular fa-envelope" />
                <input
                  type="email"
                  placeholder="Nhập Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {/* Họ tên */}
            <label className="field">
              <span>Họ và tên</span>
              <div className="field__input">
                <i className="fa-regular fa-user" />
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            {/* Mật khẩu */}
            <label className="field">
              <span>Mật khẩu</span>
              <div className="field__input">
                <i className="fa-solid fa-lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <BsEyeSlash className="eye" />
                  ) : (
                    <BsEye className="eye" />
                  )}
                </button>
              </div>
            </label>

            {/* Xác nhận mật khẩu */}
            <label className="field">
              <span>Xác nhận mật khẩu</span>
              <div className="field__input">
                <i className="fa-solid fa-lock" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <BsEyeSlash className="eye" />
                  ) : (
                    <BsEye className="eye" />
                  )}
                </button>
              </div>
            </label>

            {/* Nút đăng ký */}
            <button type="submit" className="submit" disabled={isLoading}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <p className="signup">
              Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Register;
