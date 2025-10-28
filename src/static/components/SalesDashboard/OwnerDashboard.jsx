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
    const norm = (s) => (String(s || "").toLowerCase().trim());
    const isCompleted = (s) => {
      const v = norm(s);
      return v === "completed" || v === "complete" || v === "delivered";
    };
    const isProcessing = (s) => {
      const v = norm(s);
      return (
        v === "processing" ||
        v === "awaiting shipment" ||
        v === "shipped" ||
        v === "out for delivery" ||
        v === "in transit" ||
        v === "shipping"
      );
    };

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
        // Owner name (best-effort)
        try {
          const ownerRes = await fetch("/.netlify/functions/get_owner_info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_position: "Owner" }),
          });
          if (ownerRes.ok) {
            const ownerData = await ownerRes.json();
            const od = ownerData?.data || ownerData;
            const first = od?.first_name || od?.firstName || od?.fname;
            const last = od?.last_name || od?.lastName || od?.lname;
            setOwnerName(first ? `${first} ${last || ""}`.trim() : "Owner");
          }
        } catch (e) {
          // ignore owner name failure
        }

        // Fetch total customers
        try {
          const usersRes = await fetch("/.netlify/functions/get_all_users", { method: "GET" });
          if (usersRes.ok) {
            const usersPayload = await usersRes.json();
            const totalCustomers =
              Number(usersPayload.totalCustomers ?? usersPayload.total_customers ?? usersPayload.total ?? 0) || 0;
            if (totalCustomers > 0) {
              setActiveCustomers(totalCustomers);
            }
          }
        } catch (e) {
          // ignore user fetch failure - we'll fallback to orders-derived count below
        }

        // Fetch orders (server returns totals: totalCount, activePendingTotal, completedTotal, canceledTotal, returnedTotal)
        const ordersRes = await fetch("/.netlify/functions/get_all_orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!ordersRes.ok) {
          console.warn("get_all_orders returned non-OK:", ordersRes.status);
        }

        const payload = await ordersRes.json();

        // normalize orders array
        let allOrders = [];
        if (Array.isArray(payload.orders)) allOrders = payload.orders;
        else if (Array.isArray(payload.data)) allOrders = payload.data;
        else if (Array.isArray(payload)) allOrders = payload;
        else if (payload && typeof payload === "object") {
          const arr = Object.values(payload).find((v) => Array.isArray(v));
          if (arr) allOrders = arr;
        }
        if (!Array.isArray(allOrders)) allOrders = [];

        // Use server-provided totals where applicable
        setTotalOrders(Number(payload.totalCount ?? allOrders.length));
        // completedTotal returned by server is monetary total for completed orders; keep as primary totalRevenue
        setTotalRevenue(Number(payload.completedTotal ?? payload.completed_total ?? 0));

        // --- UPDATED: Orders snapshot using orders table data (totals for each status) ---
        const snapshotCounts = { pending: 0, processing: 0, completed: 0, canceled: 0, returned: 0 };
        allOrders.forEach((o) => {
          let rawStatus = o.status ?? o.order_status ?? o.state ?? o.payment_status ?? "";
          if (typeof rawStatus === "object") rawStatus = rawStatus.name ?? rawStatus.status ?? "";
          const s = String(rawStatus || "").toLowerCase().trim();
          if (!s) return;

          if (s.includes("pending")) {
            snapshotCounts.pending++;
            return;
          }
          if (
            s.includes("processing") ||
            s.includes("awaiting shipment") ||
            s.includes("shipped") ||
            s.includes("out for delivery") ||
            s.includes("in transit") ||
            s.includes("shipping")
          ) {
            snapshotCounts.processing++;
            return;
          }
          if (s.includes("completed") || s.includes("complete") || s.includes("delivered")) {
            snapshotCounts.completed++;
            return;
          }
          if (s.includes("canceled") || s.includes("cancelled")) {
            snapshotCounts.canceled++;
            return;
          }
          if (s.includes("returned") || s.includes("return")) {
            snapshotCounts.returned++;
            return;
          }
        });
        setOrdersSnapshot(snapshotCounts);

        // --- UPDATED: Monthly sales for past 6 months (including current month) based on total amount of orders ---
        const parseDate = (ts) => {
          if (!ts && ts !== 0) return null;
          if (typeof ts === "number") {
            const millis = ts < 1e12 ? ts * 1000 : ts;
            const d = new Date(millis);
            return isNaN(d) ? null : d;
          }
          const d = new Date(ts);
          if (!isNaN(d)) return d;
          const n = Number(ts);
          if (!isNaN(n)) {
            const millis = n < 1e12 ? n * 1000 : n;
            const dd = new Date(millis);
            return isNaN(dd) ? null : dd;
          }
          return null;
        };

        const getOrderPrice = (o) => {
          const candidates = [o.total_price, o.totalPrice, o.total, o.price, o.base_price, o.basePrice, o.amount];
          for (const c of candidates) {
            if (c !== undefined && c !== null && c !== "") {
              const n = Number(c);
              if (isFinite(n)) return n;
            }
          }
          if (Array.isArray(o.items) && o.items.length) {
            return o.items.reduce((s, it) => {
              const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
              const p = Number(it.price ?? it.unit_price ?? it.unitPrice ?? 0) || 0;
              return s + qty * p;
            }, 0);
          }
          return 0;
        };

        // Build last 6 months map (use ISO key YYYY-MM for safe lookup)
        const end = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
          const label = d.toLocaleString("default", { month: "short", year: "numeric" }); // e.g., "Oct 2025"
          months.push({ iso, label });
        }

        const monthlyMap = {};
        months.forEach((m) => (monthlyMap[m.iso] = 0));

        allOrders.forEach((o) => {
          const rawTs = o.order_timestamp ?? o.orderDate ?? o.created_at ?? o.createdAt ?? o.timestamp ?? o.date;
          const d = parseDate(rawTs);
          if (!d) return;
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyMap.hasOwnProperty(iso)) return; // skip orders outside past 6 months
          monthlyMap[iso] += getOrderPrice(o);
        });

        const salesArr = months.map((m) => ({ month: m.label, revenue: monthlyMap[m.iso] || 0 }));
        setSalesData(salesArr);

        // Top selling truck models (most frequent truck_model in orders table)
        const modelCounts = {};
        allOrders.forEach((o) => {
          // support items arrays first
          if (Array.isArray(o.items) && o.items.length) {
            o.items.forEach((it) => {
              const name = it.truck_model || it.model || it.product_name || it.name || it.product?.name;
              if (!name) return;
              const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
              if (!modelCounts[name]) modelCounts[name] = { name, sold: 0 };
              modelCounts[name].sold += qty;
            });
            return;
          }

          const name = o.truck_model || o.model || o.product_name || o.product?.model || o.product?.name || o.item_name;
          if (!name) return;
          const qty = Number(o.quantity ?? o.qty ?? 1) || 1;
          if (!modelCounts[name]) modelCounts[name] = { name, sold: 0 };
          modelCounts[name].sold += qty;
        });

        const topModels = Object.values(modelCounts).sort((a, b) => b.sold - a.sold).slice(0, 5);
        setTopProducts(topModels);

        // Active customers fallback: if get_all_users didn't set activeCustomers, compute unique ids from orders
        if (!activeCustomers || activeCustomers === 0) {
          const uidCandidates = ["userid", "user_id", "userId", "customer_id", "customerId", "buyer_id", "buyerId"];
          const uniqueUserIds = new Set();
          allOrders.forEach((o) => {
            for (const k of uidCandidates) {
              if (o[k] !== undefined && o[k] !== null) {
                uniqueUserIds.add(String(o[k]));
                return;
              }
            }
            if (o.user && (o.user.id || o.user._id)) uniqueUserIds.add(String(o.user.id ?? o.user._id));
            else if (o.customer && (o.customer.id || o.customer._id)) uniqueUserIds.add(String(o.customer.id ?? o.customer._id));
            else if (o.buyer && (o.buyer.id || o.buyer._id)) uniqueUserIds.add(String(o.buyer.id ?? o.buyer._id));
          });
          setActiveCustomers(uniqueUserIds.size);
        }
      } catch (err) {
        // minimal error feedback
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <button className="logout-btn" onClick={handleLogout} style={{ marginLeft: "auto" }}>
          Sign Out
        </button>
      </header>

      <p className="owner-dashboard-welcome">
        Welcome back, <strong>{ownerName}</strong>!
      </p>

      {/* Summary Cards */}
      <div className="owner-dashboard-summary-grid">
        <div className="owner-dashboard-container">
          <p className="owner-dashboard-container-title">Total Revenue</p>
          <div className="owner-dashboard-revenue-value">₱{Number(totalRevenue).toLocaleString()}</div>
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
        <h3 className="owner-dashboard-section-title">📈 Monthly Sales Performance (last 6 months)</h3>
        <div className="owner-dashboard-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="month" fontSize={14} />
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
                ₱{Number(p.price || 0).toLocaleString()} | <strong>{p.sold} sold</strong>
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
