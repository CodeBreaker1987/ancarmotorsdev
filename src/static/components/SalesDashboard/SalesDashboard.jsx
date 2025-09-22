// src/static/components/SalesDashboard/SalesDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./SalesDashboard.css";
import AncarLogo from "../../../assets/media/AncarLogo.7ad7473b37e000adbeb6.png";

// Color palette for pie charts

const COLORS = [
  "#4F46E5", // completed
  "#EF4444", // canceled
  "#F59E0B", // returned
  "#10B981", // processing
  "#6366F1", // shipped
  "#06B6D4", // out for delivery
];

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Awaiting Shipment",
  "Shipped",
  "Out for Delivery",
  "Completed",
  "Canceled",
  "Returned",
];

const FILTERS = [
  { label: "Active & Pending", statuses: ["Pending", "Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"] },
  { label: "Processing", statuses: ["Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"] },
  { label: "Completed", statuses: ["Completed"] },
  { label: "Canceled", statuses: ["Canceled"] },
  { label: "Returned", statuses: ["Returned"] },
];

// Truck model groups
const ELF_MODELS = [
  "Boom Truck Elf", "Closed Van Elf", "Dropside Elf", "Freezer Van Elf",
  "Garbage Compactor Elf", "Manlifter Elf", "Mini Dump Elf", "Tow Truck Elf", "Wing Van Elf"
];
const FORWARD_MODELS = [
  "Closed Van Fwd", "Dropside Fwd", "Dump Truck Fwd", "Freezer Van FWD",
  "Wing Van FWD", "Fb Type"
];
const GIGA_MODELS = [
  "Cargo Truck", "Closed Van 10w", "Dump Truck 10w", "Tractor Head",
  "Water Tanker", "Wing Van 10w"
];

// Pie chart helper
function PieChartBox({ data }) {
  return data.length === 0 ? (
    <div style={{ textAlign: "center", color: "#888", paddingTop: "100px" }}>
      No data for this month.
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          dataKey="value"
          data={data}
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function SalesDashboard() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filterIdx, setFilterIdx] = useState(0);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(true);
  const [chartStatus, setChartStatus] = useState("Completed"); // "Completed" = Sold, "Canceled", "Returned"

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/.netlify/functions/get_all_orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month }),
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        alert("Error fetching orders: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, month]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("user");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  // --- Change order status ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch("/.netlify/functions/update_order_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderid === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  // --- Filter orders by selected filter ---
  const filteredOrders = useMemo(() => {
    const filterStatuses = FILTERS[filterIdx].statuses;
    return orders.filter((o) => filterStatuses.includes(o.status));
  }, [orders, filterIdx]);

  // --- Sales Data for Truck Model Pie Charts ---
  const monthOrders = useMemo(() =>
    orders.filter(o => o.order_timestamp.startsWith(month)), [orders, month]);

  function getModelPieData(models, status) {
    const filtered = monthOrders.filter(o =>
      models.includes(o.truck_model) && o.status === status
    );
    const counts = {};
    models.forEach(model => { counts[model] = 0; });
    filtered.forEach(o => { counts[o.truck_model] += o.quantity || 1; });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([model, count]) => ({ name: model, value: count }));
  }

  const soldRevenue = useMemo(() => {
  if (chartStatus !== "Completed") return 0;
  return monthOrders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
}, [monthOrders, chartStatus]);


  if (!user) return <p>Please log in to view the sales dashboard.</p>;

  return (
    <div className="sales-dashboard">
      <header className="dashboard-header">
        <img src={AncarLogo} alt="Ancar Motors Logo" className="logo" />
        <h1>Admin Sales Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      {/* Orders Table Section */}
      <section className="orders-section">
        <div className="orders-header">
          <h2>Customer Orders</h2>
          <div>
            <select
              value={filterIdx}
              onChange={(e) => setFilterIdx(Number(e.target.value))}
              style={{ marginRight: "1rem" }}
            >
              {FILTERS.map((f, idx) => (
                <option key={f.label} value={idx}>
                  {f.label}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>UserID</th>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Home Address</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Truck Model</th>
                <th>Body Color</th>
                <th>Payload</th>
                <th>Towing</th>
                <th>Lifting</th>
                <th>Transmission</th>
                <th>Quantity</th>
                <th>Base Price</th>
                <th>Total Price</th>
                <th>Shipping Option</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={22}>Loading...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.orderid}>
                    <td>{o.orderid}</td>
                    <td>{new Date(o.order_timestamp).toLocaleString()}</td>
                    <td>{o.userid}</td>
                    <td>{o.username}</td>
                    <td>{o.first_name}</td>
                    <td>{o.last_name}</td>
                    <td>{o.home_address}</td>
                    <td>{o.email_address}</td>
                    <td>{o.phone_number}</td>
                    <td>{o.truck_model}</td>
                    <td>{o.body_color}</td>
                    <td>{o.payload_capacity}</td>
                    <td>{o.towing_capacity}</td>
                    <td>{o.lifting_capacity}</td>
                    <td>{o.transmission}</td>
                    <td>{o.quantity}</td>
                    <td>₱ {Number(o.base_price || 0).toLocaleString()}</td>
                    <td>₱ {Number(o.total_price || 0).toLocaleString()}</td>
                    <td>{o.shipping_option}</td>
                    <td>{o.payment_method}</td>
                    <td>
                      <span className="status">{o.status}</span>
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.orderid, e.target.value)
                        }
                        disabled={
                          o.status === "Completed" ||
                          o.status === "Canceled" ||
                          o.status === "Returned"
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={22}>No orders found for this filter/month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sales Charts Section */}
      <section className="sales-section">
        <div className="sales-header">
          <h2>Sales Data — {month}</h2>
           {chartStatus === "Completed" && (
      <div style={{ fontWeight: "bold", marginTop: "10px" }}>
        Total Revenue: ₱ {soldRevenue.toLocaleString()}
      </div>
    )}
        </div>
        <div className="sales-chart-filters">
          <label>
            Show:
            <select
              value={chartStatus}
              onChange={e => setChartStatus(e.target.value)}
              style={{ marginLeft: "0.5rem", marginRight: "2rem" }}
            >
              <option value="Completed">Sold</option>
              <option value="Canceled">Canceled</option>
              <option value="Returned">Returned</option>
            </select>
          </label>
          <label>
            Month:
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>
        <div className="charts-grid">
          <div className="chart-box">
            <h3>Isuzu Elf — {chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}</h3>
            <PieChartBox data={getModelPieData(ELF_MODELS, chartStatus)} />
          </div>
          <div className="chart-box">
            <h3>Isuzu Forward — {chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}</h3>
            <PieChartBox data={getModelPieData(FORWARD_MODELS, chartStatus)} />
          </div>
          <div className="chart-box">
            <h3>Isuzu Giga — {chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}</h3>
            <PieChartBox data={getModelPieData(GIGA_MODELS, chartStatus)} />
          </div>
        </div>
      </section>

      <footer className="dashboard-footer">
        <p>
          Dashboard is fully interactive. Sales and orders update automatically
          with status changes.
        </p>
      </footer>
    </div>
  );
}
