import { deleteUserforAdmin } from '../../../services/apiServices';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";
import './UpdateDelete.scss';
const ModeldeleteUserforAdmin = (props) => {
  const {show, setShow, dataDelete} = props;

  const handleClose = () => setShow(false);
  const handleSubmit = async() => {
      let data = await deleteUserforAdmin(dataDelete.id);
      if(data && data.EC === 0) {
          toast.success("Delete user successfully");
          props.setCurrentPage(1);
          await props.fetchListUsersWithPaginate(1);
          handleClose();
      } 
      if(data && data.EC !== 0) {
        toast.error(data.EM);
      }
}

  return (
    <>
      <Modal show={show} 
      onHide={handleClose}
      backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Xóa người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>Xác nhận xóa người dùng <b>{dataDelete && dataDelete.email ? dataDelete.email: ""}</b></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModeldeleteUserforAdmin;