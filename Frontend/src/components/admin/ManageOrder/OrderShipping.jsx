import { useState } from 'react';
import { FaShippingFast } from 'react-icons/fa';
import './OrderShipping.scss';
import OrderViewModal from './OrderViewModal';

const OrderShipping = ({ orders = [] }) => {
  const [viewOrder, setViewOrder] = useState(null);
  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="order-shipping-wrap">
      {ordersList.length === 0 ? (
        <div className="empty-state">
          <FaShippingFast size={48} />
          <p>Hiện không có đơn hàng đang giao.</p>
        </div>
      ) : (
        <>
          <div className="list-head shipping">
            <h3>Đơn hàng đang giao ({ordersList.length})</h3>
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
                  <th>Ngày dự kiến giao</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order, index) => (
                  <tr key={index}>
                    <td className="mono">{index+1}</td>
                    <td>{order.recipientName}</td>
                    <td className="amount">{Number(order.totalPrice || 0).toLocaleString()} ₫</td>
                    <td>{order.paymentMethod || '—'}</td>
                    <td>{order.paymentStatus || '—'}</td>
                    <td>
                        {order.receivedDate
                        ? new Date(order.receivedDate).toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            })
                            : '—'}
                        </td>
                    <td className="actions-col">
                      <button className="btn view" onClick={() => setViewOrder(order)}>Xem</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {viewOrder && (
        <OrderViewModal order={viewOrder} onClose={() => setViewOrder(null)} showUpdateButton={false} />
      )}
    </div>
  );
};

export default OrderShipping;
