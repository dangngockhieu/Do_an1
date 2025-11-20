import { useState, useEffect, useCallback } from 'react';
import './ManageOrder.scss';
import OrderPending from './OrderPending';
import OrderShipping from './OrderShipping';
import OrderCompleted from './OrderCompleted';
import {
  getOrderPendingforAdmin,
  getOrderforAdmin,
} from '../../../services/apiServices';
import { toast } from 'react-toastify';

const TAB_STATES = { PENDING: 'PENDING', SHIPPING: 'SHIPPING', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' };

const ManageOrder = () => {
  const [activeTab, setActiveTab] = useState(TAB_STATES.PENDING);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1 });


  const fetchOrders = useCallback(
    async (status = TAB_STATES.PENDING, page = 1) => {
      setLoading(true);
      setOrders([]);
      try {
        let res;
        if(status === TAB_STATES.PENDING){
          res = await getOrderPendingforAdmin(page, pagination.limit)
        }
        else{
          res = await getOrderforAdmin(page, pagination.limit, status)
        }

        if (res?.EC === 0 && res.DT) {
          const { orders, pg } = res.DT;
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
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option className='option' value={TAB_STATES.PENDING}>Chờ xử lý</option>
            <option className='option' value={TAB_STATES.SHIPPING}>Đang giao</option>
            <option className='option' value={TAB_STATES.COMPLETED}>Hoàn thành</option>
          </select>
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
        ) : (activeTab === TAB_STATES.SHIPPING ?(
            <OrderShipping
              orders={orders}
              pagination={pagination}
              setPage={p => fetchOrders(activeTab, p)}
            />
          ): (activeTab === TAB_STATES.COMPLETED ? (
              <OrderCompleted
                orders={orders}
                pagination={pagination}
                setPage={p => fetchOrders(activeTab, p)}
              />
            ):null))}
      </main>
    </div>
  );
};

export default ManageOrder;
