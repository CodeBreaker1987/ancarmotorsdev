import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- Payment Failed Page ---
export function PaymentFailed({ onRedirect, onCancel }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onRedirect) onRedirect();
      else navigate("/InventoryNav");
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate, onRedirect]);

  return (
    <div className="paymongo-fail-container">
      <h2>Payment Failed</h2>
      <p>Unfortunately, your payment was not successful.</p>
      <p>You will be redirected to the inventory stocks page shortly.</p>
      <button onClick={() => (onRedirect ? onRedirect() : navigate("/InventoryNav"))}>
        Redirect Now
      </button>
      <button onClick={() => (onCancel ? onCancel() : navigate("/"))}>
        Cancel
      </button>
    </div>
  );
}