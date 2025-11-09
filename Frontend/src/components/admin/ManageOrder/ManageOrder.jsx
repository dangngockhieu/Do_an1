import { useState, useEffect, useCallback } from 'react';
import './ManageOrder.scss';
import OrderPending from './OrderPending';
import OrderShipping from './OrderShipping';
import {
  getOrderPendingforAdmin,
  getOrderShippingforAdmin,
} from '../../../services/apiServices';
import { toast } from 'react-toastify';

const TAB_STATES = { PENDING: 'PENDING', SHIPPING: 'SHIPPING' };

const ManageOrder = () => {
  const [activeTab, setActiveTab] = useState(TAB_STATES.PENDING);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, totalPages: 1 });

  const fetchOrders = useCallback(
    async (status = TAB_STATES.PENDING, page = 1) => {
      setLoading(true);
      setOrders([]);
      try {
        let res =
          status === TAB_STATES.PENDING
            ? await getOrderPendingforAdmin(page, pagination.limit)
            : await getOrderShippingforAdmin(page, pagination.limit);

        if (res?.EC === 0 && res.DT) {
          const { orders, pagination: pg } = res.DT;
          setOrders(orders || []);
          setPagination({
            page: pg?.currentPage || 1,
            limit: pagination.limit,
            totalPages: pg?.totalPages || 1,
          });
        } else toast.error(res?.EM || 'Không thể tải đơn hàng.');
      } catch {
        toast.error('Lỗi kết nối. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchOrders(activeTab, 1);
  }, [activeTab, fetchOrders]);

  return (
    <div className="manage-order-container">
      <header className="manage-order-header">
        <h1>Quản lý đơn hàng</h1>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === TAB_STATES.PENDING ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_STATES.PENDING)}
          >
            Đơn chờ xử lý
          </button>
          <button
            className={`tab-btn ${activeTab === TAB_STATES.SHIPPING ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_STATES.SHIPPING)}
          >
            Đang giao
          </button>
        </div>
      </header>

      <main className="manage-order-body">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : activeTab === TAB_STATES.PENDING ? (
          <OrderPending
            orders={orders}
            pagination={pagination}
            setPage={p => fetchOrders(activeTab, p)}
            onRefresh={() => fetchOrders(activeTab, pagination.page)}
          />
        ) : (
          <OrderShipping
            orders={orders}
            pagination={pagination}
            setPage={p => fetchOrders(activeTab, p)}
            onRefresh={() => fetchOrders(activeTab, pagination.page)}
          />
        )}
      </main>
    </div>
  );
};

export default ManageOrder;
