import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BankPay.css";

export default function BankPay({ amount = 0, onSuccess = () => {}, onFail = () => {} }) {
  const [bank, setBank] = useState("BDO");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a short processing delay (e.g., API call)
    setTimeout(() => {
      if (cardNumber && cardHolder && expiry && cvv) {
        onSuccess();
        navigate("/PaySuccess");
      } else {
        onFail();
        navigate("/PayFailed");
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
          {loading ? "Processing..." : `Pay ₱${(amount || 0).toLocaleString()}`}
        </button>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing your payment, please wait...</p>
        </div>
      )}
    </div>
  );
}
