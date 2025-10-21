import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./InstallmentPay.css";

// --- Installment Payment Page ---
export default function InstallmentPay({ amount, onSuccess, onFail }) {
  const [payType, setPayType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [income, setIncome] = useState("Business");
  const [period, setPeriod] = useState("6 Months");
  const navigate = useNavigate();
  const location = useLocation();

  // slip & orders summary (reads from location.state or sessionStorage)
  const loc = location.state || {};
  const ordersFromState = Array.isArray(loc.orders) ? loc.orders : [];
  const ordersFromSession = JSON.parse(sessionStorage.getItem("multiOrders") || "[]") || [];
  const orders = ordersFromState.length > 0 ? ordersFromState : ordersFromSession;

  const transaction_number =
    loc.transaction_number ||
    loc.transactionNumber ||
    sessionStorage.getItem("currentSlipNumber") ||
    null;

  // Use baseAmount derived from session orders when present, otherwise use prop amount
  const baseAmount = orders.length > 0
    ? orders.reduce((s, o) => s + (Number(o.totalPrice || o.total_price) || 0), 0)
    : Number(amount || 0);

  // Calculations (use baseAmount)
  const rate = 0.015;
  const periodMap = {
    "6 Months": 6,
    "1 Year": 12,
    "2 Years": 24,
    "3 Years": 36,
    "5 Years": 60,
  };
  const installments = periodMap[period];
  const totalInterest = baseAmount * rate * installments;
  const totalAmount = baseAmount + totalInterest;
  const installmentAmount = totalAmount / installments;
  const firstPaymentDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (payType && cardNumber && cardHolder && expiry && cvv) {
      onSuccess();
      navigate("/PaySuccess", { state: { orders, transaction_number } });
    } else {
      onFail();
      navigate("/PayFailed", { state: { orders, transaction_number } });
    }
  };

  return (
    <div className="installment-pay-container">
      <h2>INSTALLMENT PAYMENT FORM</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Payment Option:
          <select value={payType} onChange={e => setPayType(e.target.value)} required>
            <option value="">Select</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
          </select>
        </label>
        {payType && (
          <>
            <label>
              Card Number:
              <input
                type="text"
                value={cardNumber}
                onChange={e => {
                  // Allow only numbers and spaces, max 24 digits
                  let val = e.target.value.replace(/[^\d ]/g, "");
                  val = val.replace(/(\d{24})\d*/, "$1");
                  setCardNumber(val);
                }}
                required
                maxLength={29}
                inputMode="numeric"
                pattern="[0-9 ]*"
                placeholder="Enter card number"
              />
            </label>
            <label>
              CardHolder Name:
              <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} required />
            </label>
            <label>
              Card Expiry Date:
              <input type="month" value={expiry} onChange={e => setExpiry(e.target.value)} required />
            </label>
            <label>
              CVV:
              <input
                type="text"
                value={cvv}
                onChange={e => {
                  let val = e.target.value.replace(/[^\d]/g, "");
                  val = val.slice(0, 4);
                  setCvv(val);
                }}
                required
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="CVV"
              />
            </label>
          </>
        )}
        <label>
          Source of Income:
          <select value={income} onChange={e => setIncome(e.target.value)}>
            {["Business", "Crypto", "Investment", "Earned Income", "Rental Income"].map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>
        <div>
          <label>Select Installment Period:</label>
          {Object.keys(periodMap).map(p => (
            <label key={p} style={{ marginRight: 10 }}>
              <input
                type="radio"
                name="period"
                value={p}
                checked={period === p}
                onChange={() => setPeriod(p)}
              />
              {p}
            </label>
          ))}
        </div>
        <div className="installment-summary">
          <p><b>Installment Rate:</b> 1.5%</p>
          <p><b>Number of Installments:</b> {installments}</p>
          <p><b>Installment Amount:</b> ₱{installmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p><b>First Payment Date:</b> {firstPaymentDate}</p>
          <p><b>Total Amount:</b> ₱{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <button type="submit">Pay ₱{installmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} / installment</button>
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
            <span>₱{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
