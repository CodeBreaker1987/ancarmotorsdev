import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PaySuccess.css";

// --- Payment Success Page ---
export default function PaymentSuccess({ onRedirect, onCancel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(10);

  // accept orders & slip via location.state, fallback to sessionStorage
  const loc = location.state || {};
  const ordersFromState = Array.isArray(loc.orders) ? loc.orders : [];
  const ordersFromSession =
    JSON.parse(sessionStorage.getItem("multiOrders") || "[]") ||
    JSON.parse(sessionStorage.getItem("pendingOrder") || "[]") ||
    [];
  const orders = ordersFromState.length > 0 ? ordersFromState : ordersFromSession;

  const transaction_number =
    loc.transaction_number ||
    loc.transactionNumber ||
    sessionStorage.getItem("currentSlipNumber") ||
    null;

  const orderIds = Array.isArray(loc.orderIds) ? loc.orderIds : [];

  const totalAmount = orders.reduce((s, o) => s + (Number(o.totalPrice || o.total_price) || 0), 0);

  const handleRedirect = () => {
    const lastProductPage = JSON.parse(localStorage.getItem("lastProductPage") || "null");
    if (lastProductPage?.pathname) {
      navigate(lastProductPage.pathname, { state: { fromCheckout: true } });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    const timer = setTimeout(() => {
      handleRedirect();
    }, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="payment-success-container">
      <h2>Payment Successful!</h2>
      <p>Your order has been placed and payment was successful.</p>
      <p>You will be redirected in <b>{seconds}</b> seconds.</p>

      <div className="payment-success-actions">
        <button onClick={handleRedirect}>Redirect Now</button>
        <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>Cancel</button>
      </div>

      {/* Slip summary positioned under the main container content */}
      <div className="slip-summary">
        {transaction_number && (
          <div className="slip-header">
            <strong>Transaction Slip:</strong>
            <span className="slip-number">{transaction_number}</span>
          </div>
        )}

        <div className="orders-summary">
          <h3>Order Summary ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="no-orders">No order details available.</p>
          ) : (
            <ul>
              {orders.map((o, idx) => {
                const truckLabel =
                  (o.truck && (o.truck.model || o.truck.description)) ||
                  o.truck_model ||
                  `Order ${idx + 1}`;
                return (
                  <li key={idx} className="order-item">
                    <div className="order-main">
                      <div className="order-title">
                        <strong>#{idx + 1}</strong>
                        <span className="order-truck">{truckLabel}</span>
                      </div>
                      <div className="order-meta">
                        <span>Qty: {o.quantity || 1}</span>
                        <span>Unit: ₱{Number(o.unitPrice || o.base_price || 0).toLocaleString()}</span>
                        <span>Total: ₱{Number(o.totalPrice || o.total_price || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    {orderIds[idx] && <div className="order-id">Order ID: {orderIds[idx]}</div>}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="orders-footer">
            <strong>Grand Total:</strong>
            <span>₱{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}