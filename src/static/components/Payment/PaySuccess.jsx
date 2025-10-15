import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- Payment Success Page ---
export function PaymentSuccess({ onRedirect, onCancel }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onRedirect) onRedirect();
      else navigate(location.state?.lastProductPath || "/");
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate, location, onRedirect]);

  return (
    <div className="paymongo-success-container">
      <h2>Payment Successful!</h2>
      <p>Your order has been placed and payment was successful.</p>
      <p>You will be redirected to the product page shortly.</p>
      <button onClick={() => (onRedirect ? onRedirect() : navigate(location.state?.lastProductPath || "/"))}>
        Redirect Now
      </button>
      <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>
        Cancel
      </button>
    </div>
  );
}