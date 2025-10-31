import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";
import { changeRoleUserforAdmin } from '../../../services/apiServices';
import _ from 'lodash';
import './UpdateDelete.scss';
const ModelUpdateUser = (props) => {
const { show, setShow, dataUpdate} = props;
const handleClose = () => {
  setShow(false);
  setRole("USER");
  props.resetUpdateData();
}
const [role, setRole] = useState("USER");

useEffect(() => {
  if(!_.isEmpty(dataUpdate)) {
    setRole(dataUpdate.role);
  }
}, [dataUpdate]);

const handleSubmiUpdateUser = async() => {
  let data = await changeRoleUserforAdmin(dataUpdate.id,role);
  if(data && data.EC === 0) {
    toast.success("Update user successfully");
    handleClose();
    await props.fetchListUsersWithPaginate(props.currentPage);
  } 
  if(data && data.EC !== 0) {
    toast.error(data.EM);
  }
}
  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop="static" className="model-add-user">
        <Modal.Header closeButton>
          <Modal.Title>Update User: {dataUpdate.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <form className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={(event)=>setRole(event.target.value)}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>handleSubmiUpdateUser()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ModelUpdateUser;