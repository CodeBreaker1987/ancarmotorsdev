import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PayMongoSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Show success for 10 seconds, then redirect to product page
    const timer = setTimeout(() => {
      navigate("/units-stock"); // or your product listing page
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="paymongo-success-container">
      <h2>Payment Successful!</h2>
      <p>Your order has been placed and payment was successful.</p>
      <p>You will be redirected to the product page shortly.</p>
    </div>
  );
}