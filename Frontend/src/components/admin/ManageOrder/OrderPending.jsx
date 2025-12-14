import { useState } from 'react';
import './OrderPending.scss';
import { FaBoxes, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import OrderViewModal from './OrderViewModal';
import OrderUpdateModal from './OrderUpdateModal';
import ReactPaginate from "react-paginate";
import { BsArrowRightCircleFill } from "react-icons/bs";
import { deleteOrder } from '../../../services/apiServices';
import { toast } from 'react-toastify';

const OrderPending = ({ orders = [], pagination = {}, setPage, onRefresh }) => {
  const [viewOrder, setViewOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const ordersList = Array.isArray(orders) ? orders : [];
  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setPage(newPage);
  };

  const getSerialNumber = (index) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const handleDeleteOrder = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteOrder(deleteConfirm.orderID);
      if (res?.EC === 0) {
        toast.success('Đã hủy đơn hàng thành công!');
        onRefresh?.();
      } else {
        toast.error(res?.EM || 'Không thể hủy đơn hàng');
      }
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi hủy đơn hàng');
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="order-pending-wrap">
      {ordersList.length === 0 ? (
        <div className="empty-state">
          <FaBoxes size={48} />
          <p>Hiện không có đơn hàng chờ xử lý.</p>
        </div>
      ) : (
        <>
          <div className="list-head">
            <h3>Số đơn hàng chờ xử lý ({ordersList.length})</h3>
          </div>

          <div className="table-wrap">
            <table className="order-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người nhận</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái thanh toán</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order, idx) => (
                  <tr key={order.orderID || order.id || idx}>
                    <td>{getSerialNumber(idx)}</td>
                    <td>{order.recipientName}</td>
                    <td className="amount">{Number(order.totalPrice || 0).toLocaleString()} ₫</td>
                    <td>{order.paymentMethod || '—'}</td>
                    <td>{order.paymentStatus || '—'}</td>
                    <td>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="actions-col">
                      <button className="btn view" onClick={() => setViewOrder(order)}>
                        Xem
                      </button>
                      <button className="btn edit" onClick={() => setUpdateOrder(order)}>
                        Cập nhật
                      </button>
                      <button className="btn delete" onClick={() => setDeleteConfirm(order)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pagination.totalPages > 0 && (
      <ReactPaginate
        nextLabel={<BsArrowRightCircleFill style={{ fontSize: "1.5rem" }} />}
        previousLabel={
          <BsArrowRightCircleFill
            style={{ fontSize: "1.5rem", transform: "scaleX(-1)" }}
          />
        }
        onPageChange={handlePageClick}
        pageCount={pagination.totalPages}
        forcePage={pagination.page - 1}
        containerClassName="pagination"
        activeClassName="active"
      />
      )}

      {viewOrder && (
        <OrderViewModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          showUpdateButton={true}
          onOpenUpdate={() => {
            setUpdateOrder(viewOrder);
            setViewOrder(null);
          }}
        />
      )}

      {updateOrder && (
        <OrderUpdateModal
          order={updateOrder}
          onClose={() => setUpdateOrder(null)}
          onSuccess={() => {
            setUpdateOrder(null);
            onRefresh?.();
          }}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteConfirm(null)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <FaExclamationTriangle />
            </div>
            <h2>Xác nhận hủy đơn hàng</h2>
            <p>Bạn có chắc chắn muốn hủy đơn hàng này của <strong>{deleteConfirm.recipientName}</strong> không?</p>
            <p className="warning-text">Hành động này không thể hoàn tác và số lượng sản phẩm sẽ được hoàn lại vào kho.</p>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Không, giữ lại
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleDeleteOrder}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang hủy...' : 'Có, hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPending;
