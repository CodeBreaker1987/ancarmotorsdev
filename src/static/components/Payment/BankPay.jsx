import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BankPay.css";

// --- Bank Payment Page ---
export default function BankPay({ amount = 0, onSuccess = () => {}, onFail = () => {} }) {
  const [bank, setBank] = useState("BDO");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate payment success/fail
    if (cardNumber && cardHolder && expiry && cvv) {
      onSuccess();
    } else {
      onFail();
    }
  };

  return (
    <div className="bank-pay-container">
      <h2>BANK PAYMENT FORM</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Banking Option:
          <select value={bank} onChange={e => setBank(e.target.value)}>
            {["BDO", "BPI", "ChinaBank", "RCBC", "UnionBank", "MetroBank", "PSBank", "MasterCard"].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          Debit Card Number:
          <input
            type="text"
            value={cardNumber}
            onChange={e => {
              // Allow only numbers and spaces, max 24 digits
              let val = e.target.value.replace(/[^\d ]/g, "");
              val = val.replace(/(\d{24})\d*/, "$1"); // Limit to 24 digits
              setCardNumber(val);
            }}
            required
            maxLength={29} // 24 digits + up to 5 spaces
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
              // Allow only numbers, max 4 digits
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
        <button type="submit">Pay ₱{(amount || 0).toLocaleString()}</button>
      </form>
    </div>
  );
}