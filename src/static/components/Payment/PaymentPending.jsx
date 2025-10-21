import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PaymentPending.css";

export default function PaymentPending({ onRedirect, onCancel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(10);

  // read orders & slip from location.state or sessionStorage
  const loc = location.state || {};
  const ordersFromState = Array.isArray(loc.orders) ? loc.orders : [];
  const ordersFromSession = JSON.parse(sessionStorage.getItem("multiOrders") || "[]") || [];
  const orders = ordersFromState.length > 0 ? ordersFromState : ordersFromSession;

  const transaction_number =
    loc.transaction_number ||
    loc.transactionNumber ||
    sessionStorage.getItem("currentSlipNumber") ||
    null;

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

  const handleRedirect = () => {
    if (onRedirect) {
      onRedirect();
      return;
    }
    const lastProductPage = JSON.parse(localStorage.getItem("lastProductPage") || "null");
    if (lastProductPage?.pathname) {
      navigate(lastProductPage.pathname);
    } else {
      navigate("/");
    }
  };

  const totalAmount = orders.reduce((s, o) => s + (Number(o.totalPrice || o.total_price) || 0), 0);

  return (
    <div className="payment-pending-container">
      <h2>Order Placed Successfully!</h2>
      <p>Your order has been registered and is awaiting payment confirmation.</p>
      <p>Please check your email for the payment slip and instructions.</p>
      <p>You will be redirected in <b>{seconds}</b> seconds.</p>

      <div className="payment-pending-buttons">
        <button onClick={handleRedirect}>Redirect Now</button>
        <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>Cancel</button>
      </div>

      {/* Slip summary shown under main content */}
      <div className="slip-summary pending-slip">
        {transaction_number && (
          <div className="slip-header">
            <strong>Transaction Slip:</strong>
            <span className="slip-number">{transaction_number}</span>
          </div>
        )}

        <div className="orders-summary">
          <h3>Order Summary ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="no-orders">No orders available.</p>
          ) : (
            <ul>
              {orders.map((o, i) => (
                <li key={i} className="order-item">
                  <div className="order-main">
                    <div className="order-title">
                      <strong>{(o.truck && (o.truck.model || o.truck.description)) || o.truck_model || `Order ${i + 1}`}</strong>
                    </div>
                    <div className="order-meta">
                      <span>Qty: {o.quantity || 1}</span>
                      <span>Unit: ₱{Number(o.unitPrice || o.base_price || 0).toLocaleString()}</span>
                      <span>Line Total: ₱{Number(o.totalPrice || o.total_price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="orders-footer">
            <strong>Estimated Total:</strong>
            <span>₱{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}