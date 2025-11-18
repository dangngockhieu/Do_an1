import { useState } from 'react';
import './OrderPending.scss';
import { FaBoxes } from 'react-icons/fa';
import OrderViewModal from './OrderViewModal';
import OrderUpdateModal from './OrderUpdateModal';
import ReactPaginate from "react-paginate";
import { BsArrowRightCircleFill } from "react-icons/bs";

const OrderPending = ({ orders = [], pagination = {}, setPage, onRefresh }) => {
  const [viewOrder, setViewOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);
  const ordersList = Array.isArray(orders) ? orders : [];
  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setPage(newPage);
  };

  const getSerialNumber = (index) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
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
            <h3>Đơn hàng chờ xử lý ({ordersList.length})</h3>
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
    </div>
  );
};

export default OrderPending;
