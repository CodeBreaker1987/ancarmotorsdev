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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
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

// Pie chart helper with total amount display for sold units and click-to-expand modal
function PieChartBox({ data, showAmount, monthOrders, title }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (data.length === 0) {
    return <div style={{ textAlign: "center", color: "#888", paddingTop: "100px" }}>No data for this month.</div>;
  }
  // If showAmount, add total amount per model to tooltip
  const pieData = data.map(d => {
    if (!showAmount || !monthOrders) return d;
    // Find all orders for this model
    const total = monthOrders
      .filter(o => o.truck_model === d.name && o.status === "Completed")
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    return { ...d, amount: total };
  });
  return (
    <>
      <div style={{ cursor: "pointer" }} onClick={() => setModalOpen(true)}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              dataKey="value"
              data={pieData}
              outerRadius={80}
              label={({ name, value, amount }) =>
                showAmount && amount ? `${name}: ${value} (₱${amount.toLocaleString()})` : `${name}: ${value}`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => {
              if (showAmount && props.payload.amount) {
                return [`${value} units, ₱${props.payload.amount.toLocaleString()}`, name];
              }
              return [value, name];
            }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setModalOpen(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 500, boxShadow: "0 8px 32px rgba(79,70,229,0.18)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24 }}>{title || "Pie Chart Details"}</h2>
            <ResponsiveContainer width={500} height={400}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={pieData}
                  outerRadius={150}
                  label={({ name, value, amount }) =>
                    showAmount && amount ? `${name}: ${value} (₱${amount.toLocaleString()})` : `${name}: ${value}`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => {
                  if (showAmount && props.payload.amount) {
                    return [`${value} units, ₱${props.payload.amount.toLocaleString()}`, name];
                  }
                  return [value, name];
                }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {/* Details Table */}
            <table style={{ marginTop: 24, width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Model</th>
                  <th style={{ textAlign: "right", padding: "8px 12px" }}>Units</th>
                  <th style={{ textAlign: "right", padding: "8px 12px" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {pieData.map((d, idx) => (
                  <tr key={d.name}>
                    <td style={{ padding: "8px 12px" }}>{d.name}</td>
                    <td style={{ textAlign: "right", padding: "8px 12px" }}>{d.value}</td>
                    <td style={{ textAlign: "right", padding: "8px 12px" }}>{d.amount ? `₱${d.amount.toLocaleString()}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={{ marginTop: 32, padding: "10px 24px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }} onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

// PieChartBox static display (no hover effect)
function PieChartBoxStatic({ title, data, showAmount, monthOrders }) {
  return (
    <div className="chart-box">
      <h3>{title}</h3>
      <PieChartBox data={data} showAmount={showAmount} monthOrders={monthOrders} />
    </div>
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
  // Column toggle state
  const allColumns = [
    { key: "username", label: "Username" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "home_address", label: "Home Address" },
    { key: "email_address", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "truck_model", label: "Truck Model" },
    { key: "body_color", label: "Body Color" },
    { key: "payload_capacity", label: "Payload" },
    { key: "towing_capacity", label: "Towing" },
    { key: "lifting_capacity", label: "Lifting" },
    { key: "transmission", label: "Transmission" },
    { key: "quantity", label: "Quantity" },
    { key: "base_price", label: "Base Price" },
    { key: "total_price", label: "Total Price" },
    { key: "shipping_option", label: "Shipping Option" },
    { key: "payment_method", label: "Payment Method" },
  ];
  const [visibleColumns, setVisibleColumns] = useState(() => allColumns.map(col => col.key));
  const [showColDropdown, setShowColDropdown] = useState(false);
  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };
  // Search and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("orderid");
  const [sortField, setSortField] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  // Pagination state for orders table
  const [ordersPage, setOrdersPage] = useState(0);
  const ORDERS_PER_PAGE = 10;
  // Management level logic
  const positionLevels = {
    "ceo": "top",
    "chief operating officer": "top",
    "president": "top",
    "sales administrator": "middle",
    "sales manager": "middle",
    "it technician": "bottom",
    "sales agent": "bottom",
    "owner": "owner",
    // Add more positions as needed
  };
  function getManagementLevel(position) {
    if (!position || typeof position !== "string") return "bottom";
    const normalized = position.trim().toLowerCase();
    const pos = positionLevels[normalized];
    return pos || "bottom";
  }
  const userLevel = getManagementLevel(user?.company_position || user?.position);

  // --- Current date/time and page runtime ---
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [runtime, setRuntime] = useState(0); // seconds
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setRuntime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatDateTime(dt) {
    return dt.toLocaleString();
  }
  function formatRuntime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  }

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

  // Reset to first page when filter/search/sort/month changes
  useEffect(() => {
    setOrdersPage(0);
  }, [filterIdx, searchTerm, searchField, sortField, sortAsc, month]);

  // Removed code that clears user from localStorage on unload/refresh

  const { logout } = useUser();
  const handleLogout = () => {
    logout(); // triggers confirmation modal
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

  // --- Filter, search, and sort orders ---
  const filteredOrders = useMemo(() => {
    const filterStatuses = FILTERS[filterIdx].statuses;
    let filtered = orders.filter((o) => filterStatuses.includes(o.status));
    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(o => {
        if (searchField === "orderid") return String(o.orderid).toLowerCase().includes(term);
        if (searchField === "userid") return String(o.userid).toLowerCase().includes(term);
        if (searchField === "username") return String(o.username).toLowerCase().includes(term);
        return true;
      });
    }
    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[sortField] || "").toLowerCase();
        const bVal = String(b[sortField] || "").toLowerCase();
        if (aVal < bVal) return sortAsc ? -1 : 1;
        if (aVal > bVal) return sortAsc ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [orders, filterIdx, searchTerm, searchField, sortField, sortAsc]);

  // Pagination: slice filteredOrders for current page
  const paginatedOrders = useMemo(() => {
    const start = ordersPage * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, ordersPage]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

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
       {/* Return Button for Owner */}
      {user?.company_position?.toLowerCase() === "owner" && (
        <div style={{ margin: "24px 0 0 0", display: "flex", justifyContent: "flex-start" }}>
          <button
            style={{
              padding: "10px 28px",
              borderRadius: 8,
              background: "#4F46E5",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(79,70,229,0.08)"
            }}
            onClick={() => navigate("/OwnerDashboard")}
          >
            Return to Overview
          </button>
        </div>
      )}
      <header className="dashboard-header">
        <img src={AncarLogo} alt="Ancar Motors Logo" className="logo" />
        <h1>Company Sales Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

     

    <div className="user-info">
      <p>Welcome, <strong>{user.first_name} {user.last_name}</strong> ({user.company_position || user.position})</p>
      <p>Management Level: <strong>{userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}</strong></p>
      <p>Current Date/Time: <strong>{formatDateTime(currentTime)}</strong></p>
      <p>Page Runtime: <strong>{formatRuntime(runtime)}</strong></p>
    </div>

      {/* Orders Table Section - Only for Top & Bottom Level */}
      {(userLevel === "top" || userLevel === "bottom" || userLevel ==="owner") && (
        <section className="orders-section">
          <div className="orders-header">
            <h2 style={{fontWeight: "bold", fontSize: "30px", color: "darkblue" }}>Customer Orders</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem" }}>
              <select
                value={filterIdx}
                onChange={(e) => setFilterIdx(Number(e.target.value))}
                style={{ marginLeft: "0.5rem", border: "none", background: "#2e529aff", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "bold" }}
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
              {/* Search bar and sort dropdowns */}
              <select value={searchField} onChange={e => setSearchField(e.target.value)} style={{ marginLeft: "2rem", border: "none", background: "#2e529aff", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "bold" }}>
                <option value="orderid">OrderID</option>
                <option value="userid">UserID</option>
                <option value="username">Username</option>
              </select>

              <input
                type="text"
                placeholder={`Search by ${searchField.charAt(0).toUpperCase() + searchField.slice(1)}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginLeft: "0", padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              />
              
              <select value={sortField} onChange={e => setSortField(e.target.value)} style={{ marginLeft: "0.5rem", border: "none", background: "#2e529aff", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "bold" }}>
                <option value="">Sort By</option>
                <option value="userid">UserID</option>
                <option value="username">Username</option>
              </select>
              <button type="button" onClick={() => setSortAsc(a => !a)} style={{ marginLeft: "0.5rem", padding: "4px 8px", borderRadius: "6px", background: "#5282e2ff", border: "none", cursor: "pointer", color: "white", fontWeight: "bold" }}>
                {sortAsc ? "Asc" : "Desc"}
              </button>
              {/* Column toggle dropdown */}
              <div className="column-toggle-dropdown" style={{ position: "relative" }}>
                <button type="button" style={{ padding: "6px 10px", borderRadius: "6px", background: "#e5e7eb", border: "none", cursor: "pointer" }}
                  onClick={() => setShowColDropdown((v) => !v)}>
                  Toggle Columns ▼
                </button>
                {showColDropdown && (
                  <div style={{ position: "absolute", top: "110%", left: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 10, padding: "10px", minWidth: "120px" }}>
                    {allColumns.map(col => (
                      <label key={col.key} style={{ display: "block", marginBottom: "6px" }}>
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                        /> {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>UserID</th>
                  {allColumns.map(col => visibleColumns.includes(col.key) && <th key={col.key}>{col.label}</th>)}
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={22}>Loading...</td>
                  </tr>
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((o) => (
                    <tr key={o.orderid}>
                      <td>{o.orderid}</td>
                      <td>{new Date(o.order_timestamp).toLocaleString()}</td>
                      <td>{o.userid}</td>
                      {allColumns.map(col => visibleColumns.includes(col.key) && <td key={col.key}>{col.key === "base_price" || col.key === "total_price" ? `₱ ${Number(o[col.key] || 0).toLocaleString()}` : o[col.key]}</td>)}
                      <td><span className="status">{o.status}</span></td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.orderid, e.target.value)}
                          disabled={o.status === "Completed" || o.status === "Canceled" || o.status === "Returned"}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
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
            {/* Pagination Controls */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16, gap: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => setOrdersPage(p => Math.max(0, p - 1))}
                disabled={ordersPage === 0}
                style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: ordersPage === 0 ? "#f3f4f6" : "#2563eb", color: ordersPage === 0 ? "#888" : "#fff", fontWeight: 600, cursor: ordersPage === 0 ? "not-allowed" : "pointer" }}
              >
                ◀ Previous
              </button>
              {/* Page Numbers */}
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setOrdersPage(i)}
                    style={{
                      minWidth: 32,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: ordersPage === i ? "2px solid #2563eb" : "1px solid #d1d5db",
                      background: ordersPage === i ? "#2563eb" : "#fff",
                      color: ordersPage === i ? "#fff" : "#222",
                      fontWeight: ordersPage === i ? 700 : 500,
                      cursor: ordersPage === i ? "default" : "pointer"
                    }}
                    disabled={ordersPage === i}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOrdersPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={ordersPage >= totalPages - 1 || totalPages === 0}
                style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: (ordersPage >= totalPages - 1 || totalPages === 0) ? "#f3f4f6" : "#2563eb", color: (ordersPage >= totalPages - 1 || totalPages === 0) ? "#888" : "#fff", fontWeight: 600, cursor: (ordersPage >= totalPages - 1 || totalPages === 0) ? "not-allowed" : "pointer" }}
              >
                Next ▶
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sales Charts Section - Only for Top & Middle Level */}
      {(userLevel === "top" || userLevel === "middle" || userLevel ==="owner") && (
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
              <h3>{`Isuzu Elf — ${chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}`}</h3>
              <PieChartBox data={getModelPieData(ELF_MODELS, chartStatus)} showAmount={chartStatus === "Completed"} monthOrders={monthOrders} title={`Isuzu Elf — ${chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}`} />
            </div>
            <div className="chart-box">
              <h3>{`Isuzu Forward — ${chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}`}</h3>
              <PieChartBox data={getModelPieData(FORWARD_MODELS, chartStatus)} showAmount={chartStatus === "Completed"} monthOrders={monthOrders} title={`Isuzu Forward — ${chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}`} />
            </div>
            <div className="chart-box">
              <h3>{`Isuzu Giga — ${chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}`}</h3>
              <PieChartBox data={getModelPieData(GIGA_MODELS, chartStatus)} showAmount={chartStatus === "Completed"} monthOrders={monthOrders} title={`Isuzu Giga — ${chartStatus === "Completed" ? "Sold" : chartStatus === "Canceled" ? "Canceled" : "Returned"}`} />
            </div>
          </div>
          {/* --- Bar Chart: Most Popular Models Sold per Series --- */}
          <div className="chart-box">
            <h3>Most Popular Models Sold (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[...getModelPieData(ELF_MODELS, "Completed"), ...getModelPieData(FORWARD_MODELS, "Completed"), ...getModelPieData(GIGA_MODELS, "Completed")]}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12}/>
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* --- Line Chart: Sales Growth by Series --- */}
          <div className="chart-box">
            <h3>Sales Growth by Series (Line Chart)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={getSalesGrowthData(orders)}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Elf" stroke="#4F46E5" />
                <Line type="monotone" dataKey="Forward" stroke="#06B6D4" />
                <Line type="monotone" dataKey="Giga" stroke="#F59E0B" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* --- Pareto Chart: Truck Models Contribution to Sales --- */}
          <div className="chart-box">
            <h3>Pareto Chart: Truck Models Contribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={getParetoData(orders)}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12}/>
                <YAxis yAxisId="left" allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="value" fill="#6366F1" />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#EF4444" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* --- Map Chart: Sales by Region/Province/City (skipped unless region data exists) --- */}
          {/* If you have region/city data, you can use recharts ScatterChart or a map library here. */}
        </section>
      )}
    </div>
  );
}

// Helper for line chart: sales growth by series
function getSalesGrowthData(orders) {
  // Group by month for each series
  const series = [
    { key: "Elf", models: ELF_MODELS },
    { key: "Forward", models: FORWARD_MODELS },
    { key: "Giga", models: GIGA_MODELS }
  ];
  // Get all months in data
  const months = Array.from(new Set(
    orders
      .filter(o => o.status === "Completed")
      .map(o => o.order_timestamp.slice(0, 7))
  )).sort();
  return months.map(month => {
    const obj = { period: month };
    series.forEach(s => {
      obj[s.key] = orders.filter(o => o.status === "Completed" && o.order_timestamp.startsWith(month) && s.models.includes(o.truck_model)).reduce((sum, o) => sum + (o.quantity || 1), 0);
    });
    return obj;
  });
}

// Helper for pareto chart: truck models contribution to sales
function getParetoData(orders) {
  // Sum sold units per model
  const sold = orders.filter(o => o.status === "Completed");
  const modelCounts = {};
  sold.forEach(o => {
    modelCounts[o.truck_model] = (modelCounts[o.truck_model] || 0) + (o.quantity || 1);
  });
  const arr = Object.entries(modelCounts).map(([name, value]) => ({ name, value }));
  arr.sort((a, b) => b.value - a.value);
  // Cumulative percentage
  const total = arr.reduce((sum, x) => sum + x.value, 0);
  let cum = 0;
  arr.forEach(x => {
    cum += x.value;
    x.cumulative = Math.round((cum / total) * 100);
  });
  return arr;
}
