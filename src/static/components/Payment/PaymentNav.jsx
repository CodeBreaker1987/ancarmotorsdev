import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- Main PaymentNav Router ---
export default function PaymentNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentMethod, truck, totalPrice } = location.state || {};

  // Success handler: redirect to product page and trigger order success popup
  const handleSuccess = () => {
    navigate("/PaymentSuccess", {
      state: { lastProductPath: `/product/${truck?.description?.replace(/\s+/g, "-").toLowerCase()}`, truck }
    });
  };

  // Fail handler: redirect to failed page
  const handleFail = () => {
    navigate("/PaymentFailed");
  };

  if (paymentMethod === "Bank Transfer") {
    return <BankPay amount={totalPrice} onSuccess={handleSuccess} onFail={handleFail} />;
  }
  if (paymentMethod === "Installment") {
    return <InstallmentPay amount={totalPrice} onSuccess={handleSuccess} onFail={handleFail} />;
  }
  if (location.pathname === "/PaymentSuccess") {
    return <PaymentSuccess onRedirect={() => navigate(location.state?.lastProductPath || "/")} onCancel={() => navigate("/")} />;
  }
  if (location.pathname === "/PaymentFailed") {
    return <PaymentFailed onRedirect={() => navigate("/InventoryNav")} onCancel={() => navigate("/")} />;
  }
  return <div>Invalid payment method.</div>;
}