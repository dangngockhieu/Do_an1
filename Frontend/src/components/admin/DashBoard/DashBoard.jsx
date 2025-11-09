import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,  ResponsiveContainer} from "recharts";
import {FaBoxOpen, FaUsers, FaShoppingBag, FaMoneyBillWave} from "react-icons/fa";
import { IoGameController } from "react-icons/io5";
import "./Dashboard.scss";
import { useEffect, useState } from "react";
import {
    countUsersforAdmin,
    countProductsforAdmin,
    countOrdersthisMonth,
    getRevenueThisMonthforAdmin,
    getRevenueByMonthforAdmin,
} from "../../../services/apiServices";
import { toast } from "react-toastify";

const Dashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [chartData, setChartData] = useState([]);

  // ===== Fetch APIs =====
    const fetchCountUsers = async () => {
        try {
            const res = await countUsersforAdmin();
            if (res?.EC === 0 && res.DT) {
                setUserCount(res.DT.count || 0);
            }
        } catch (error) {
            toast.error("Lỗi lấy số lượng người dùng");
        }
    };

    const fetchCountProducts = async () => {
        try {
            const res = await countProductsforAdmin();
            if (res?.EC === 0 && res.DT) {
                setProductCount(res.DT.count || 0);
            }
        } catch (error) {
            toast.error("Lỗi lấy số lượng sản phẩm");
        }
    };

    const fetchCountOrders = async () => {
        try {
            const res = await countOrdersthisMonth();
            if (res?.EC === 0 && res.DT) {
                setOrderCount(res.DT.count || 0);
            }
        } catch (error) {
            toast.error("Lỗi lấy số lượng đơn hàng");
        }
    };

    const fetchRevenueThisMonth = async () => {
        try {
            const res = await getRevenueThisMonthforAdmin();
            if (res?.EC === 0 && res.DT) {
                setRevenue(res.DT.revenue || 0);
            }
        } catch (error) {
            toast.error("Lỗi lấy doanh thu tháng này");
        }
    };

    const fetchRevenueByMonth = async () => {
        try {
            const res = await getRevenueByMonthforAdmin();
            if (res?.EC === 0 && Array.isArray(res.DT)) {
            // Convert dữ liệu  (VND) sang triệu VNĐ
                const data = res.DT.map((value, index) => ({
                    month: new Date(0, index).toLocaleString("vi-VN", { month: "short" }),
                    revenue: Number((value / 1_000_000).toFixed(1)), 
                }));
                setChartData(data);
            }
        } catch (error) {
            toast.error("Lỗi lấy dữ liệu biểu đồ doanh thu");
        }
    };

    useEffect(() => {
        fetchCountUsers();
        fetchCountProducts();
        fetchCountOrders();
        fetchRevenueThisMonth();
        fetchRevenueByMonth();
    }, []);

  // ===== Hiển thị các thẻ thống kê =====
    const stats = [
    {
        title: "Sản phẩm",
        value: productCount,
        color: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        icon: <FaBoxOpen />,
    },
    {
        title: "Người dùng",
        value: userCount,
        color: "linear-gradient(135deg, #10b981, #34d399)",
        icon: <FaUsers />,
    },
    {
        title: "Đơn hàng tháng này",
        value: orderCount,
        color: "linear-gradient(135deg, #f59e0b, #fbbf24)",
        icon: <FaShoppingBag />,
    },
    {
        title: "Doanh thu tháng này",
        value: `₫${(revenue / 1_000_000).toFixed(2)}M`,
        color: "linear-gradient(135deg, #ef4444, #f87171)",
        icon: <FaMoneyBillWave />,
    },
    ];

    return (
        <div className="dashboard">
            <div className="header">
                <h2> <IoGameController
                    style={{ paddingRight: "8px", paddingBottom: "6px", fontSize: "36px"}}
                />{" "}
                    Bảng điều khiển
                </h2>
            </div>

            <div className="stats-grid">
                {stats.map((item, index) => (
                    <div className="stat-card" key={index}>
                        <div className="icon" style={{ background: item.color }}>
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
                        <Tooltip formatter={(v) => `₫${v}M`} />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
