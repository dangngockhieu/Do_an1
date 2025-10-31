import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import _ from 'lodash';
import './CreateView.scss';
const ModelViewUser = (props) => {
  const { show, setShow, dataUpdate } = props;
  const handleClose = () => {
    setShow(false);
  };

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");

  useEffect(() => {
    if (!_.isEmpty(dataUpdate)) {
      setEmail(dataUpdate.email || "");
      setName(dataUpdate.name || "");
      setRole(dataUpdate.role || "USER");
    }
  }, [dataUpdate]);

  return (
    <Modal show={show} onHide={handleClose}
  backdrop="static" className="model-user">
      <Modal.Header closeButton>
        <Modal.Title>View User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="user-form">
  <div className="form-group full">
    <label>Email</label>
    <input type="email" className="form-control" value={email} disabled />
  </div>

  <div className="row-group">
    <div className="form-group">
      <label>Name</label>
      <input type="text" className="form-control" value={name} disabled />
    </div>

    <div className="form-group">
      <label>Role</label>
      <select className="form-select" value={role} disabled>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>
  </div>
</form>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelViewUser;