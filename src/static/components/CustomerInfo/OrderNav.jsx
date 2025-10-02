import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderNav.css";
import { images } from "../NewInventory/InventoryHeader";
import { useUser } from "../../Context/UserContext.jsx";

function getTruckImage(model) {
const truck = images.find(t => t.description === model);
return truck ? truck.icon : "https://via.placeholder.com/120";
}

const OrderNav = () => {
  const navigate = useNavigate();

  const { user } = useUser();

 useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/get_orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userid }), // pass userId
      });

      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchOrders();
}, [user.userid]);

  const filteredOrders = statusFilter === "active"
  ? orders.filter(order => order.status === "active" || order.status === "Pending")
  : orders.filter(order => order.status === statusFilter);

  // --- Cancel order ---
  const handleCancel = async (orderID) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderID}?`))
      return;

    try {
      const res = await fetch("/.netlify/functions/cancel_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID, userId: user.userid }),
      });

      if (!res.ok) throw new Error("Failed to cancel order");
      alert(`✅ Order ${orderID} cancelled successfully.`);

      // Remove cancelled order from state
      setOrders((prev) =>
        prev.map((o) =>
          o.orderid === orderID ? { ...o, status: "canceled" } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error cancelling order: " + err.message);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="dashboard-parallax">
    <div className="dashboard-container">
      <h2 className="dashboard-title">Customer Order Dashboard</h2>

      {/* Status Tabs */}
      <div className="tab-container">
        {["Pending","active", "Completed", "Canceled"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`tab-button ${
              statusFilter === status ? "active-tab" : ""
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} Orders
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Timestamp</th>
              <th>Truck</th>
              <th>Model</th>
              <th>Color</th>
              <th>Payload</th>
              <th>Towing</th>
              <th>Lifting</th>
              <th>Transmission</th>
              <th>Qty</th>
              <th>Base Price</th>
              <th>Total Price</th>
              <th>Shipping</th>
              <th>Payment</th>
              {statusFilter === "active" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.orderid}>
                  <td>{order.orderid}</td>
                  <td>{order.order_timestamp}</td>
                  <td>
                    <img
                      src={getTruckImage(order.truck_model)}
                      alt={order.truck_model}
                      className="truck-img"
                    />
                  </td>
                  <td>{order.truck_model}</td>
                  <td>{order.body_color}</td>
                  <td>{order.payload_capacity}</td>
                  <td>{order.towing_capacity}</td>
                  <td>{order.lifting_capacity}</td>
                  <td>{order.transmission}</td>
                  <td>{order.quantity}</td>
                  <td>₱{Number(order.base_price).toLocaleString()}</td>
                  <td>₱{Number(order.total_price).toLocaleString()}</td>
                  <td>{order.shipping_option}</td>
                  <td>{order.payment_method}</td>
                  {statusFilter === "active" && (
                    <td>
                      {(order.status === "Pending" || order.status === "processing") ? (
      <button
        className="cancel-button"
        onClick={() => {
          setSelectedOrderId(order.orderid);
          setShowCancelModal(true);
        }}
      >
        Cancel
      </button>
    ) : (
      <span style={{ color: "#aaa" }}>Not allowed</span>
    )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={statusFilter === "active" ? 15 : 14}>
                  No {statusFilter} orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Navigation Buttons */}
      <div className="nav-buttons">
        <button onClick={() => navigate("/")} className="return-button">
          Return to Homepage
        </button>
        <button onClick={() => navigate("/InventoryNav")} className="shop-button">
          Shop More Trucks
        </button>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Confirm Cancellation</h3>
      <p>Are you sure you want to cancel order {selectedOrderId}?</p>
      <button
        className="confirm-button"
        onClick={() => {
          handleCancel(selectedOrderId);
          setShowCancelModal(false);
        }}
      >
        Yes, Cancel Order
      </button>
      <button
        className="cancelbutton"
        onClick={() => setShowCancelModal(false)}
      >
        No, Keep Order
      </button>
    </div>
  </div>
)}

    </div>
    </div>
  );
};


export default OrderNav;
