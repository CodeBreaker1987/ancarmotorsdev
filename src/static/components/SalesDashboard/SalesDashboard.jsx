// src/static/components/SalesDashboard/SalesDashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
} from "recharts";
import { BiLoaderAlt } from 'react-icons/bi';
import "./SalesDashboard.css";
import AncarLogo from "../../../assets/media/AncarLogo.7ad7473b37e000adbeb6.png";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ---------- Constants ---------- */

const COLORS = [
  "#4F46E5",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#06B6D4",
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

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "continuous", label: "Continuous" },
];

const FILTERS = [
  { label: "Active & Pending", statuses: ["Pending", "Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"] },
  { label: "Processing", statuses: ["Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"] },
  { label: "Completed", statuses: ["Completed"] },
  { label: "Canceled", statuses: ["Canceled"] },
  { label: "Returned", statuses: ["Returned"] },
];

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

/* ---------- Helper utilities ---------- */

const normalizeStatus = (s) => String(s || "").trim().toLowerCase();

const normalizeTimestampToISO = (ts) => {
  if (!ts) return null;
  try {
    const str = String(ts);
    if (str.includes("T") || str.endsWith("Z")) return new Date(str).toISOString();
    const maybeIso = str.replace(" ", "T");
    const d = new Date(maybeIso);
    if (!isNaN(d.getTime())) return d.toISOString();
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback.toISOString();
  } catch (e) {
    return null;
  }
};

const parsePrice = (v) => {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/[₱,\s]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

/* ---------- Component ---------- */

export default function SalesDashboard() {
  const { user, setUser, logout } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [filterIdx, setFilterIdx] = useState(0);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState([
    "username","first_name","last_name","home_address","email_address","phone_number",
    "truck_model","body_color","payload_capacity","towing_capacity","lifting_capacity",
    "transmission","quantity","base_price","total_price","shipping_option","payment_method"
  ]);
  const [showColDropdown, setShowColDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("orderid");
  const [sortField, setSortField] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [ordersPage, setOrdersPage] = useState(0);
  const ORDERS_PER_PAGE = 10;

  const [refreshTimer, setRefreshTimer] = useState(null);

  // track per-transaction resend in-flight
  const [sendingSlipTx, setSendingSlipTx] = useState({}); // { [transaction_number]: true }

  const positionLevels = {
    "ceo": "top",
    "chief operating officer": "top",
    "president": "top",
    "sales administrator": "middle",
    "sales manager": "middle",
    "it technician": "bottom",
    "sales agent": "bottom",
    "owner": "owner",
  };
  const userLevel = (pos => {
    if (!pos || typeof pos !== "string") return "bottom";
    const normalized = pos.trim().toLowerCase();
    return positionLevels[normalized] || "bottom";
  })(user?.company_position || user?.position);

  // Fetch functions
  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const currentFilter = FILTERS[filterIdx];
      const statusFilter = currentFilter.statuses.map(s => String(s).trim());

      const [ordersRes, allOrdersRes] = await Promise.all([
        fetch("/.netlify/functions/get_all_orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month,
            statusFilter,
            page: ordersPage + 1,
            limit: ORDERS_PER_PAGE,
          }),
        }),
        fetch("/.netlify/functions/get_sales_data"),
      ]);

      const ordersText = await ordersRes.text();
      const allOrdersText = await allOrdersRes.text();

      let ordersJson = {}, allOrdersJson = {};
      try {
        ordersJson = ordersText ? JSON.parse(ordersText) : {};
      } catch (e) {
        console.error("Failed to parse get_all_orders JSON:", e);
        throw new Error("Invalid JSON from get_all_orders");
      }
      try {
        allOrdersJson = allOrdersText ? JSON.parse(allOrdersText) : {};
      } catch (e) {
        console.error("Failed to parse get_sales_data JSON:", e);
        throw new Error("Invalid JSON from get_sales_data");
      }

      if (!ordersRes.ok) {
        throw new Error(ordersJson.error || "Failed to fetch orders");
      }
      if (!allOrdersRes.ok) {
        throw new Error(allOrdersJson.error || "Failed to fetch sales data");
      }

      const normalizeRow = (r) => ({
        ...r,
        orderid: r.orderid ?? r.orderId ?? r.id,
        transaction_number: r.transaction_number ?? r.transactionNumber ?? r.transaction_number ?? null,
        userid: r.userid ?? r.user_id ?? r.userId,
        username: r.username ?? r.user_name,
        truck_model: r.truck_model ?? r.truckModel,
        quantity: r.quantity ?? r.qty,
        total_price: parsePrice(r.total_price ?? r.totalPrice),
        base_price: parsePrice(r.base_price ?? r.basePrice),
        payment_status: (r.payment_status ?? r.paymentStatus ?? "pending"),
        status: r.status ?? r.order_status ?? "",
        order_timestamp: normalizeTimestampToISO(r.order_timestamp ?? r.created_at ?? r.order_date) || r.order_timestamp || null,
        first_name: r.first_name ?? r.firstName ?? "",
        last_name: r.last_name ?? r.lastName ?? "",
        home_address: r.home_address ?? r.address ?? "",
        email_address: r.email_address ?? r.email ?? "",
        phone_number: r.phone_number ?? r.phone ?? "",
      });

      const ordersArr = Array.isArray(ordersJson.orders)
        ? ordersJson.orders.map(normalizeRow)
        : [];
      const allOrdersArr = Array.isArray(allOrdersJson.orders)
        ? allOrdersJson.orders.map(normalizeRow)
        : [];

      setOrders(ordersArr);
      setAllOrders(allOrdersArr);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userid, filterIdx, month, ordersPage]);

  useEffect(() => {
    setOrdersPage(0);
  }, [filterIdx, searchTerm, searchField, sortField, sortAsc, month]);

  const scheduleSlipRefresh = async (userid, slipType = "active") => {
    try {
      await fetch("/.netlify/functions/schedule_slip_refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, slipType }),
      });
      console.log(`Scheduled slip refresh for user ${userid} type ${slipType}`);
    } catch (err) {
      console.error("Error scheduling slip refresh:", err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch("/.netlify/functions/update_order_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderid: orderId,     // Changed from orderId to orderid to match backend
          status: newStatus 
        })
      });

      // Try to get response text first
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid server response');
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Update local state
      setOrders(prev => prev.map(o => 
        o.orderid === orderId ? { ...o, status: newStatus } : o
      ));
      setAllOrders(prev => prev.map(o => 
        o.orderid === orderId ? { ...o, status: newStatus } : o
      ));

      toast.success(`Order status updated to ${newStatus}`);

    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update order status");
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatusRaw) => {
    try {
      const newStatus = normalizeStatus(newStatusRaw);
      const response = await fetch("/.netlify/functions/update_payment_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const txt = await response.text();
      let json = {};
      try { json = txt ? JSON.parse(txt) : {}; } catch(e) { console.error("Invalid JSON from update_payment_status:", txt); }

      if (!response.ok) {
        throw new Error(json.error || "Failed to update payment status");
      }

      setOrders(prev => prev.map(o => o.orderid === orderId ? { ...o, payment_status: newStatus } : o));
      setAllOrders(prev => prev.map(o => o.orderid === orderId ? { ...o, payment_status: newStatus } : o));

      const changedOrder = orders.find(o => o.orderid === orderId);
      if (changedOrder?.userid) {
        scheduleSlipRefresh(changedOrder.userid, "active");
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      alert("Error updating payment status: " + (err.message || err));
    }
  };

  const filteredOrders = useMemo(() => {
    const filterStatuses = FILTERS[filterIdx].statuses.map(s => normalizeStatus(s));
    let filtered = orders.filter(o => filterStatuses.includes(normalizeStatus(o.status)));

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(o => {
        if (searchField === "orderid") return String(o.orderid || "").toLowerCase().includes(term);
        if (searchField === "userid") return String(o.userid || "").toLowerCase().includes(term);
        if (searchField === "username") return String(o.username || "").toLowerCase().includes(term);
        return true;
      });
    }

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

  const paginatedOrders = useMemo(() => {
    const start = ordersPage * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, ordersPage]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const soldRevenue = useMemo(() => {
    const statusNeeded = "completed";
    const monthStart = new Date(month + "-01");
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    return allOrders
      .filter(o => normalizeStatus(o.status) === statusNeeded)
      .filter(o => {
        const dt = o.order_timestamp ? new Date(o.order_timestamp) : null;
        return dt && dt >= monthStart && dt < monthEnd;
      })
      .reduce((sum, o) => sum + parsePrice(o.total_price), 0);
  }, [allOrders, month]);

  const scheduleRefresh = useCallback(() => {
    // Clear existing timer if any
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Schedule new refresh in 5 minutes
    const newTimer = setTimeout(async () => {
      await fetchOrders();
    }, 5 * 60 * 1000); // 5 minutes

    setRefreshTimer(newTimer);
  }, [refreshTimer]);

  // Resend single transaction slip (triggers create_slip_scheduled netlify function)
  const handleResendSlip = async (transactionNumber) => {
    if (!transactionNumber) {
      toast.error("No transaction slip number available for this order");
      return;
    }
    try {
      setSendingSlipTx(prev => ({ ...prev, [transactionNumber]: true }));
      const res = await fetch("/.netlify/functions/create_slip_scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_number: transactionNumber }),
      });
      const txt = await res.text();
      let json = {};
      try { json = txt ? JSON.parse(txt) : {}; } catch (e) { json = { message: txt }; }

      if (!res.ok) {
        throw new Error(json.error || json.message || "Failed to schedule slip resend");
      }

      toast.success(`Resend scheduled for slip ${transactionNumber}`);
    } catch (err) {
      console.error("Error resending slip:", err);
      toast.error(`Failed to resend slip: ${err.message || err}`);
    } finally {
      setSendingSlipTx(prev => {
        const copy = { ...prev };
        delete copy[transactionNumber];
        return copy;
      });
    }
  };

  useEffect(() => {
    scheduleRefresh();
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [orders, filterIdx]); // Reschedule when orders or filter changes

  if (!user) {
    return <p>Please log in to view the sales dashboard.</p>;
  }

  return (
    <div className="sales-dashboard">
        <ToastContainer position="top-right" />
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
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </header>

      <div className="user-info">
        <p>Welcome, <strong>{user.first_name} {user.last_name}</strong> ({user.company_position || user.position})</p>
        <p>Management Level: <strong>{userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}</strong></p>
        <p>Current Date/Time: <strong>{new Date().toLocaleString()}</strong></p>
      </div>

      {(userLevel === "top" || userLevel === "bottom" || userLevel === "owner") && (
        <section className="orders-section">
          <div className="orders-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontWeight: "bold", fontSize: "30px", color: "darkblue" }}>Customer Orders</h2>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <select value={filterIdx} onChange={e => setFilterIdx(Number(e.target.value))}
                style={{ border: "none", background: "#2e529aff", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "bold" }}>
                {FILTERS.map((f, idx) => <option key={f.label} value={idx}>{f.label}</option>)}
              </select>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
              <select value={searchField} onChange={e => setSearchField(e.target.value)}
                style={{ border: "none", background: "#2e529aff", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "bold" }}>
                <option value="orderid">OrderID</option>
                <option value="userid">UserID</option>
                <option value="username">Username</option>
              </select>
              <input
                type="text"
                placeholder={`Search by ${searchField}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              />
              <select value={sortField} onChange={e => setSortField(e.target.value)}
                style={{ border: "none", background: "#2e529aff", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "bold" }}>
                <option value="">Sort By</option>
                <option value="userid">UserID</option>
                <option value="username">Username</option>
              </select>
              <button
                type="button"
                onClick={() => setSortAsc(a => !a)}
                style={{ padding: "4px 8px", borderRadius: "6px", background: "#5282e2ff", border: "none", cursor: "pointer", color: "white", fontWeight: "bold" }}
              >
                {sortAsc ? "Asc" : "Desc"}
              </button>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  style={{ padding: "6px 10px", borderRadius: "6px", background: "#e5e7eb", border: "none", cursor: "pointer" }}
                  onClick={() => setShowColDropdown(v => !v)}
                >Toggle Columns ▼</button>
                {showColDropdown && (
                  <div style={{ position: "absolute", top: "110%", left: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 10, padding: "10px", minWidth: "160px" }}>
                    {["username","first_name","last_name","home_address","email_address","phone_number","truck_model","body_color","payload_capacity","towing_capacity","lifting_capacity","transmission","quantity","base_price","total_price","shipping_option","payment_method"].map(col => (
                      <label key={col} style={{ display: "block", marginBottom: "6px" }}>
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col)}
                          onChange={() =>
                            setVisibleColumns(prev =>
                              prev.includes(col)
                                ? prev.filter(k => k !== col)
                                : [...prev, col]
                            )
                          }
                        /> {col}
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
                  <th>Transaction Slip</th>
                  <th>Slip Actions</th>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>UserID</th>
                  {visibleColumns.map(col => <th key={col}>{col.replace(/_/g, " ")}</th>)}
                  <th>Order Status</th>
                  <th>Change Status</th>
                  <th>Payment Status</th>
                  <th>Resend Slip</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={visibleColumns.length + 10}>Loading...</td></tr>
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map(o => (
                    <tr key={o.orderid || `${o.transaction_number}-${o.orderid}`}>
                      <td>{o.transaction_number ?? "-"}</td>

                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              navigator.clipboard?.writeText(o.transaction_number || "");
                              toast.success("Transaction slip copied to clipboard");
                            } catch (e) {
                              toast.info(o.transaction_number || "No slip available");
                            }
                          }}
                          style={{ marginRight: 6 }}
                        >
                          Copy Slip
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // navigate to a slip view page if exists, otherwise copy
                            if (o.transaction_number) {
                              navigate(`/SlipView/${encodeURIComponent(o.transaction_number)}`);
                            } else {
                              toast.info("No transaction slip to view");
                            }
                          }}
                        >
                          View Slip
                        </button>
                      </td>

                      <td>{o.orderid}</td>
                      <td>{o.order_timestamp ? new Date(o.order_timestamp).toLocaleString() : "-"}</td>
                      <td>{o.userid}</td>
                      {visibleColumns.map(col => (
                        <td key={col}>
                          {(col === "base_price" || col === "total_price")
                            ? `₱ ${parsePrice(o[col]).toLocaleString()}`
                            : (o[col] ?? "-")}
                        </td>
                      ))}
                      <td><span className="status">{o.status}</span></td>
                      <td>
                        <select
                          value={o.status}
                          onChange={e => handleStatusChange(o.orderid, e.target.value)}
                          disabled={["completed", "canceled", "returned"].includes(normalizeStatus(o.status))}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td>{(o.payment_status ? o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1) : "Pending")}</td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleResendSlip(o.transaction_number)}
                          disabled={sendingSlipTx[o.transaction_number]}
                        >
                          {sendingSlipTx[o.transaction_number] ? "Sending..." : "Resend Slip"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={visibleColumns.length + 10}>No orders found for this filter/month.</td></tr>
                )}
              </tbody>
            </table>
            
           
          </div>

           <div className="table-footer">
              <div className="pagination-controls">
                <button
                  onClick={() => setOrdersPage(ordersPage - 1)}
                  disabled={ordersPage === 0}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span>
                  Page {ordersPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setOrdersPage(ordersPage + 1)}
                  disabled={ordersPage >= totalPages - 1 || totalPages === 0}
                className="pagination-button">
                  Next
                </button>
              </div>

              {/* Removed global resend all button as requested */}
            </div>
        </section>
        
      )}

      {(userLevel === "top" || userLevel === "middle" || userLevel === "owner") && (
        <section className="sales-section">
          <div className="sales-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Sales Data</h2>
            <div style={{ textAlign: 'right', fontWeight: 700 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Total Revenue (month):</div>
              <div style={{ fontSize: 18 }}>₱ {Math.round(soldRevenue).toLocaleString()}</div>
            </div>
          </div>

          <div style={{ margin: '1rem 0' }}>
            <label>Month: </label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </div>

          <div className="charts-grid" style={{ 
  display: 'flex', 
  flexDirection: 'column',
  gap: '2rem' 
}}>
  {/* First row: Pie Charts */}
  <div style={{ 
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem'
  }}>
    {['Elf', 'Forward', 'Giga'].map(series => {
      const modelList = series === 'Elf'
        ? ELF_MODELS
        : series === 'Forward'
          ? FORWARD_MODELS
          : GIGA_MODELS;

      const monthStart = new Date(month + "-01");
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const filtered = allOrders.filter(o =>
        normalizeStatus(o.status) === "completed" &&
        o.order_timestamp &&
        (() => {
          const d = new Date(o.order_timestamp);
          return d >= monthStart && d < monthEnd;
        })() &&
        modelList.includes(o.truck_model)
      );

      const pieData = modelList.map(model => {
        const units = filtered
          .filter(o => o.truck_model === model)
          .reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
        return { name: model, value: units };
      }).filter(d => d.value > 0);

      return (
        <div className="chart-box" key={series}>
          <h3>{`Isuzu ${series} — Sold Trucks (${month})`}</h3>
          {pieData.length === 0 ? (
            <div style={{ color: '#888', padding: '2rem', textAlign: 'center' }}>No data for this month.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie 
                  dataKey="value" 
                  data={pieData} 
                  outerRadius={80}
                  label={false} // Remove labels from pie sections
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      );
    })}
  </div>

  {/* Second row: Most Popular Trucks Chart */}
  <div className="chart-box" style={{ width: '100%' }}>
    <h3>Most Popular Sold Truck Models (Top 8)</h3>
    {allOrders.length === 0 ? (
      <div style={{ color: '#EF4444', padding: '2rem', textAlign: 'center' }}>
        No orders data available.
      </div>
    ) : (() => {
      const modelStats = {};
      allOrders.filter(o => normalizeStatus(o.status) === "completed").forEach(o => {
        modelStats[o.truck_model] = (modelStats[o.truck_model] || 0) + (Number(o.quantity) || 1);
      });
      const topModels = Object.entries(modelStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      if (topModels.length === 0) {
        return <div style={{ color: '#F59E0B', padding: '2rem', textAlign: 'center' }}>No completed sales for any truck model.</div>;
      }
      return (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topModels} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} interval={0} angle={-20} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Units Sold" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      );
    })()}
  </div>

  {/* Third row: Revenue Growth Chart */}
  <div className="chart-box" style={{ width: '100%' }}>
    <h3>Revenue Growth by Series (Last 12 Months)</h3>
    {allOrders.length === 0 ? (
      <div style={{ color: '#EF4444', padding: '2rem', textAlign: 'center' }}>
        No orders data available.
      </div>
    ) : (() => {
      const now = new Date();
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      const seriesList = [
        { name: "Elf", models: ELF_MODELS, color: "#4F46E5" },
        { name: "Forward", models: FORWARD_MODELS, color: "#06B6D4" },
        { name: "Giga", models: GIGA_MODELS, color: "#F59E0B" },
      ];
      const lineData = months.map(monthStr => {
        const ms = new Date(monthStr + "-01");
        const me = new Date(ms);
        me.setMonth(me.getMonth() + 1);
        const obj = { period: monthStr };
        seriesList.forEach(series => {
          obj[series.name] = allOrders
            .filter(o =>
              normalizeStatus(o.status) === "completed"
              && o.order_timestamp
              && new Date(o.order_timestamp) >= ms
              && new Date(o.order_timestamp) < me
              && series.models.includes(o.truck_model)
            )
            .reduce((sum, o) => sum + parsePrice(o.total_price), 0);
        });
        return obj;
      });
      return (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={v => `₱${(v / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={v => `₱${Number(v).toLocaleString()}`} />
            <Legend />
            {seriesList.map(series => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                name={series.name}
                stroke={series.color}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    })()}
  </div>
</div>
        </section>
      )}
    </div>
  );
}
