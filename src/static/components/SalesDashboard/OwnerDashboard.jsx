// OwnerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./OwnerDashboard.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import AncarLogo from "../../../assets/media/AncarLogo.7ad7473b37e000adbeb6.png";
import { useUser } from "../../Context/UserContext.jsx";

export default function OwnerDashboard() {
  const [ownerName, setOwnerName] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ordersSnapshot, setOrdersSnapshot] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    canceled: 0,
    returned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const navigate = useNavigate();

  const { logout } = useUser();
    const handleLogout = () => {
      logout(); // triggers confirmation modal
    };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const position = (user.company_position || user.position || "").toLowerCase();
        setIsOwner(position.includes("owner"));
      } catch {}
    }

    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch owner name
        const ownerRes = await fetch("/.netlify/functions/get_owner_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_position: "Owner" }),
        });
        const ownerData = await ownerRes.json();
        setOwnerName(
          ownerData?.data?.first_name
            ? `${ownerData.data.first_name} ${ownerData.data.last_name}`
            : "Owner"
        );

        // Fetch all orders
        const ordersRes = await fetch("/.netlify/functions/get_all_orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const ordersData = await ordersRes.json();
        const allOrders = ordersData.orders || [];

        // Total Revenue
        const revenue = allOrders
          .filter((o) => o.status === "Completed")
          .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
        setTotalRevenue(revenue);

        // Total Orders
        setTotalOrders(allOrders.length);

        // Orders Snapshot
        const snapshot = { pending: 0, processing: 0, completed: 0, canceled: 0, returned: 0 };
        allOrders.forEach((o) => {
          const s = (o.status || "").toLowerCase();
          if (s === "pending") snapshot.pending++;
          else if (["processing", "awaiting shipment", "shipped", "out for delivery"].includes(s))
            snapshot.processing++;
          else if (s === "completed") snapshot.completed++;
          else if (s === "canceled") snapshot.canceled++;
          else if (s === "returned") snapshot.returned++;
        });
        setOrdersSnapshot(snapshot);

        // Monthly Sales Data
        const monthlyMap = {};
        allOrders.forEach((o) => {
          if (o.status !== "Completed" || !o.order_timestamp) return;
          const date = new Date(o.order_timestamp);
          if (isNaN(date)) return;

          const month = date.toLocaleString("default", { month: "short" });
          const year = date.getFullYear();
          const key = `${month} ${year}`;
          if (!monthlyMap[key]) monthlyMap[key] = 0;
          monthlyMap[key] += Number(o.total_price || 0);
        });

        const sortedMonths = Object.keys(monthlyMap).sort((a, b) => {
          const da = new Date(`${a} 1`);
          const db = new Date(`${b} 1`);
          return da - db;
        });

        const salesDataArr = sortedMonths.map((month) => ({
          month,
          revenue: monthlyMap[month],
        }));
        setSalesData(salesDataArr);

        // Top Products
        const modelCounts = {};
        allOrders.forEach((o) => {
          if (!o.truck_model) return;
          if (!modelCounts[o.truck_model])
            modelCounts[o.truck_model] = {
              name: o.truck_model,
              sold: 0,
              price: o.base_price || 0,
            };
          modelCounts[o.truck_model].sold += o.quantity || 1;
        });
        const topModels = Object.values(modelCounts)
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);
        setTopProducts(topModels);

        // Active Customers
        const uniqueUserIds = new Set(allOrders.map((o) => o.userid));
        setActiveCustomers(uniqueUserIds.size);
      } catch (err) {
        alert("Failed to load dashboard data: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
  return (
    <div className="owner-dashboard-loading">
      <AiOutlineLoading3Quarters className="owner-dashboard-icon-spinner" />
      <p>Loading owner dashboard...</p>
    </div>
  );
}


  return (
    <div className="owner-dashboard">
      <header className="owner-dashboard-header">
       <img src={AncarLogo} alt="Ancar Motors Logo" className="logo" />
      <h1 className="owner-dashboard-title">Company Owner Overview</h1>
      <button className="logout-btn" onClick={handleLogout} style={{marginLeft: 'auto'}}>
          Sign Out
        </button>
</header>

<p className="owner-dashboard-welcome">Welcome back, <strong>{ownerName}</strong>!</p>
      {/* Summary Cards */}
      <div className="owner-dashboard-summary-grid">
        <div className="owner-dashboard-container">
          <p className="owner-dashboard-container-title">Total Revenue</p>
          <div className="owner-dashboard-revenue-value">₱{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="owner-dashboard-container">
          <p className="owner-dashboard-container-title">Total Orders</p>
          <div className="owner-dashboard-order-value">{totalOrders}</div>
        </div>
        <div className="owner-dashboard-container">
          <p className="owner-dashboard-container-title">Active Customers</p>
          <div className="owner-dashboard-customer-value">{activeCustomers}</div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="owner-dashboard-section">
        <h3 className="owner-dashboard-section-title">📈 Monthly Sales Performance</h3>
        <div className="owner-dashboard-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="month" fontSize={18}/>
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="owner-dashboard-section">
        <h3 className="owner-dashboard-section-title">🏆 Top Selling Truck Models</h3>
        <ul className="owner-dashboard-top-products-list">
          {topProducts.map((p, i) => (
            <li key={i}>
              <span>{p.name}</span>
              <span>
                ₱{Number(p.price).toLocaleString()} | <strong>{p.sold} sold</strong>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Orders Snapshot */}
      <div className="owner-dashboard-section">
        <h3 className="owner-dashboard-section-title">📦 Orders Snapshot</h3>
        <div className="owner-dashboard-orders-list">
          <p>🔵 Pending: {ordersSnapshot.pending}</p>
          <p>🟡 Processing: {ordersSnapshot.processing}</p>
          <p>🟢 Completed: {ordersSnapshot.completed}</p>
          <p>🔴 Canceled: {ordersSnapshot.canceled}</p>
          <p>🟠 Returned: {ordersSnapshot.returned}</p>
        </div>
        {isOwner && (
          <button
            className="owner-dashboard-view-orders-btn"
            onClick={() => navigate("/SalesDashboard", { state: { fromOwner: true } })}
          >
            View Full Company Sales Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
