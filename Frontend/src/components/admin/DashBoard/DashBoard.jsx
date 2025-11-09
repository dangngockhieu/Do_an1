import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaBoxOpen,
  FaUsers,
  FaShoppingBag,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./Dashboard.scss";

const Dashboard = () => {
  const stats = [
    {
      title: "Sản phẩm",
      value: 128,
      color: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      icon: <FaBoxOpen />,
    },
    {
      title: "Người dùng",
      value: 542,
      color: "linear-gradient(135deg, #10b981, #34d399)",
      icon: <FaUsers />,
    },
    {
      title: "Đơn hàng",
      value: 187,
      color: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      icon: <FaShoppingBag />,
    },
    {
      title: "Doanh thu",
      value: "₫84.5M",
      color: "linear-gradient(135deg, #ef4444, #f87171)",
      icon: <FaMoneyBillWave />,
    },
  ];

  const chartData = [
    { month: "Jan", revenue: 12 },
    { month: "Feb", revenue: 19 },
    { month: "Mar", revenue: 28 },
    { month: "Apr", revenue: 22 },
    { month: "May", revenue: 35 },
    { month: "Jun", revenue: 30 },
    { month: "Jul", revenue: 41 },
    { month: "Aug", revenue: 38 },
    { month: "Sep", revenue: 52 },
    { month: "Oct", revenue: 46 },
    { month: "Nov", revenue: 55 },
    { month: "Dec", revenue: 60 },
  ];

  return (
    <div className="dashboard">
      <div className="header">
        <h2>📊 Bảng điều khiển</h2>
        <p>Tổng quan hoạt động hệ thống</p>
      </div>

      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div
              className="icon"
              style={{ background: item.color }}
            >
              {item.icon}
            </div>
            <div className="info">
              <p>{item.title}</p>
              <h3>{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <h3>Doanh thu theo tháng (triệu ₫)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
