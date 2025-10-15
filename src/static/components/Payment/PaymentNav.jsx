import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BankPay from "./BankPay";
import InstallmentPay from "./InstallmentPay";
import PaySuccess from "./PaySuccess";
import PayFailed from "./PayFailed";

// --- Main PaymentNav Router ---
export default function PaymentNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentMethod, truck, totalPrice } = location.state || {};

  // Success handler: redirect to product page and trigger order success popup
  const handleSuccess = () => {
    navigate("/PaySuccess", {
      state: {
        lastProductPath: `/product/${truck?.description?.replace(/\s+/g, "-").toLowerCase()}`,
        truck,
        fromCheckout: true // <-- Add this flag
      }
    });
  };

  // Fail handler: redirect to failed page
  const handleFail = () => {
    navigate("/PayFailed");
  };

  if (paymentMethod === "Bank Transfer") {
    return <BankPay amount={totalPrice} onSuccess={handleSuccess} onFail={handleFail} />;
  }
  if (paymentMethod === "Installment") {
    return <InstallmentPay amount={totalPrice} onSuccess={handleSuccess} onFail={handleFail} />;
  }
  if (location.pathname === "/PaySuccess") {
    return <PaySuccess onRedirect={() => navigate(location.state?.lastProductPath || "/")} onCancel={() => navigate("/")} />;
  }
  if (location.pathname === "/PayFailed") {
    return <PayFailed onRedirect={() => navigate("/InventoryNav")} onCancel={() => navigate("/")} />;
  }
  return <div>Invalid payment method.</div>;
}