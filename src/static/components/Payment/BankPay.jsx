import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BankPay.css";

export default function BankPay({ amount = 0, onSuccess = () => {}, onFail = () => {} }) {
  const [bank, setBank] = useState("BDO");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // --- slip & orders summary (reads from location.state or sessionStorage) ---
  const loc = location.state || {};
  const ordersFromState = Array.isArray(loc.orders) ? loc.orders : [];
  const ordersFromSession = JSON.parse(sessionStorage.getItem("multiOrders") || "[]") || [];
  const orders = ordersFromState.length > 0 ? ordersFromState : ordersFromSession;

  const transaction_number =
    loc.transaction_number ||
    loc.transactionNumber ||
    sessionStorage.getItem("currentSlipNumber") ||
    null;

  // compute grand total: prefer orders sum, otherwise fallback to prop amount
  const grandTotal = orders.reduce((s, o) => s + (Number(o.totalPrice || o.total_price) || 0), 0) || Number(amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a short processing delay (e.g., API call)
    setTimeout(() => {
      if (cardNumber && cardHolder && expiry && cvv) {
        onSuccess();
        navigate("/PaySuccess", { state: { orders, transaction_number } });
      } else {
        onFail();
        navigate("/PayFailed", { state: { orders, transaction_number } });
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="bank-pay-container">
      <h2>BANK PAYMENT FORM</h2>

      <form onSubmit={handleSubmit} className={loading ? "loading-form" : ""}>
        <label>
          Select Banking Option:
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            disabled={loading}
          >
            {["BDO", "BPI", "ChinaBank", "RCBC", "UnionBank", "MetroBank", "PSBank", "MasterCard"].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label>
          Debit Card Number:
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => {
              let val = e.target.value.replace(/[^\d ]/g, "");
              val = val.replace(/(\d{24})\d*/, "$1");
              setCardNumber(val);
            }}
            required
            maxLength={29}
            inputMode="numeric"
            pattern="[0-9 ]*"
            placeholder="Enter card number"
            disabled={loading}
          />
        </label>

        <label>
          CardHolder Name:
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          Card Expiry Date:
          <input
            type="month"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          CVV:
          <input
            type="text"
            value={cvv}
            onChange={(e) => {
              let val = e.target.value.replace(/[^\d]/g, "");
              val = val.slice(0, 4);
              setCvv(val);
            }}
            required
            maxLength={4}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="CVV"
            disabled={loading}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : `Pay ₱${grandTotal.toLocaleString()}`}
        </button>
      </form>

      {/* Slip summary positioned under the main container content */}
      <div className="slip-summary" style={{ marginTop: 18 }}>
        {transaction_number && (
          <div className="slip-header">
            <strong>Transaction Slip:</strong>
            <span className="slip-number" style={{ marginLeft: 8 }}>{transaction_number}</span>
          </div>
        )}

        <div className="orders-summary">
          <h3>Order Summary ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="no-orders">No order details available.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {orders.map((o, i) => (
                <li key={i} className="order-item" style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <strong>{(o.truck && (o.truck.model || o.truck.description)) || o.truck_model || `Order ${i + 1}`}</strong>
                      <div className="order-meta" style={{ marginTop: 6 }}>
                        <span>Qty: {o.quantity || 1}</span>
                        <span style={{ marginLeft: 8 }}>Unit: ₱{Number(o.unitPrice || o.base_price || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, alignSelf: "center" }}>
                      ₱{Number(o.totalPrice || o.total_price || 0).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="orders-footer" style={{ marginTop: 12 }}>
            <strong>Grand Total:</strong>
            <span>₱{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing your payment, please wait...</p>
        </div>
      )}
    </div>
  );
}
