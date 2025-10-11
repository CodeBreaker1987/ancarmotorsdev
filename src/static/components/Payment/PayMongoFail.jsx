import React from "react";
import { useNavigate } from "react-router-dom";

export default function PayMongoFail() {
  const navigate = useNavigate();

  return (
    <div className="paymongo-fail-container">
      <h2>Payment Failed</h2>
      <p>Unfortunately, your payment was not successful.</p>
      <button onClick={() => navigate("/InventoryNav")}>
        Return to Products
      </button>
    </div>
  );
}