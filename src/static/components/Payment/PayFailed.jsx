import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PayFailed.css";


// --- Payment Failed Page ---
export default function PaymentFailed({ onRedirect, onCancel }) {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds(s => s > 0 ? s - 1 : 0);
    }, 1000);
    const timer = setTimeout(() => {
      if (onRedirect) onRedirect();
      else navigate("/InventoryNav");
    }, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [navigate, onRedirect]);

  return (
    <div className="payment-fail-container">
      <h2>Payment Failed</h2>
      <p>Unfortunately, your payment was not successful.</p>
      <p>You will be redirected to the inventory stocks page in <b>{seconds}</b> seconds.</p>
      <button onClick={() => (onRedirect ? onRedirect() : navigate("/InventoryNav"))}>
        Redirect Now
      </button>
      <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>
        Cancel
      </button>
    </div>
  );
}