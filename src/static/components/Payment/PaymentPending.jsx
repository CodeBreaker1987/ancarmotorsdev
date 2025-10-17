import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PaymentPending.css";

export default function PaymentPending({ onRedirect, onCancel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(10);

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

  const handleRedirect = () => {
    const lastProductPage = JSON.parse(localStorage.getItem("lastProductPage"));
    if (onRedirect) {
      onRedirect();
    } else if (lastProductPage?.pathname) {
      navigate(lastProductPage.pathname);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="payment-pending-container">
      <h2>Order Placed Successfully!</h2>
      <p>Your order has been registered and is awaiting payment confirmation.</p>
      <p>Please check your email for the payment slip and instructions.</p>
      <p>You will be redirected in <b>{seconds}</b> seconds.</p>
      <div className="payment-pending-buttons">
        <button onClick={handleRedirect}>
          Redirect Now
        </button>
        <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>
          Cancel
        </button>
      </div>
    </div>
  );
}