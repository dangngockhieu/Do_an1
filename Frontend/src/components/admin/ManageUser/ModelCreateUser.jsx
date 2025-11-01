import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";
import { createUserforAdmin } from '../../../services/apiServices';
import './CreateView.scss';
const ModelCreateUser = (props) => {
  const { show, setShow } = props;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");

  const handleClose = () => setShow(false);

  const handleSubmitCreateUser = async () => {
    if (!email || !password || !name) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    let res = await createUserforAdmin(email, name, password, role);
    if (res && res.EC === 0) {
      toast.success("Tạo người dùng thành công!");
      setEmail("");
      setPassword("");
      setName("");
      setRole("USER");
      props.setCurrentPage(1);
      await props.fetchListUsersWithPaginate(1);
      handleClose();
    } else {
      toast.error(res.EM);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" className="model-user">
      <Modal.Header closeButton style={{ background: "#007bff", color: "#fff" }}>
        <Modal.Title>Tạo mới người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="user-form">
          <div className="form-group full">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              placeholder='Nhập email'
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              placeholder='Nhập mật khẩu'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tên người dùng</label>
            <input
              type="text"
              className="form-control"
              value={name}
              placeholder='Nhập tên người dùng'
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Vai trò</label>
            <select className="form-control" value={role} onChange={(event)=>setRole(event.target.value)}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
            </select>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmitCreateUser}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelCreateUser;
