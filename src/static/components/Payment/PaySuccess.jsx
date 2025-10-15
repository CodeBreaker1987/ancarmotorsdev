import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PaySuccess.css";

// --- Payment Success Page ---
export default function PaymentSuccess({ onRedirect, onCancel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(10);

  const handleRedirect = () => {
    const lastProductPage = JSON.parse(localStorage.getItem("lastProductPage"));
    if (lastProductPage?.pathname) {
      navigate(lastProductPage.pathname, { state: { fromCheckout: true } });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds(s => s > 0 ? s - 1 : 0);
    }, 1000);
    const timer = setTimeout(() => {
      handleRedirect();
    }, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, []);

  return (
    <div className="payment-success-container">
      <h2>Payment Successful!</h2>
      <p>Your order has been placed and payment was successful.</p>
      <p>You will be redirected to the product page in <b>{seconds}</b> seconds.</p>
      <button onClick={handleRedirect}>
        Redirect Now
      </button>
      <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>
        Cancel
      </button>
    </div>
  );
}