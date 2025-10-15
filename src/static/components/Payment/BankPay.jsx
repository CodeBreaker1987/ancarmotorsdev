import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- Bank Payment Page ---
export function BankPay({ amount, onSuccess, onFail }) {
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
      <h2>Bank Payment</h2>
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
          <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
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
          <input type="password" value={cvv} onChange={e => setCvv(e.target.value)} required maxLength={4} />
        </label>
        <button type="submit">Pay ₱{amount.toLocaleString()}</button>
      </form>
    </div>
  );
}