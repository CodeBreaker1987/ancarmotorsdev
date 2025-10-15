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

  // Calculations
  const rate = 0.015;
  const periodMap = {
    "6 Months": 6,
    "1 Year": 12,
    "2 Years": 24,
    "3 Years": 36,
    "5 Years": 60,
  };
  const installments = periodMap[period];
  const totalInterest = amount * rate * installments;
  const totalAmount = amount + totalInterest;
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
    } else {
      onFail();
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
    </div>
  );
}
