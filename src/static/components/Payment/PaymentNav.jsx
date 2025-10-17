import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BankPay from "./BankPay";
import InstallmentPay from "./InstallmentPay";
import PaySuccess from "./PaySuccess";
import PayFailed from "./PayFailed";
import PaymentPending from "./PaymentPending";

// --- Main PaymentNav Router ---
export default function PaymentNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentMethod, truck, totalPrice, user } = location.state || {};
  const [slipSent, setSlipSent] = useState(false);

  // Helper to send slip after successful payment/order
  const sendSlip = async (orderUserId) => {
    try {
      await fetch("/.netlify/functions/create_slip_scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: orderUserId || user?.userid })
      });
      setSlipSent(true);
    } catch (err) {
      console.error("Failed to send slip:", err);
    }
  };

  // Success handler for BankPay/InstallmentPay
  const handleSuccess = () => {
    // Send slip after payment success
    sendSlip(user?.userid);
    navigate("/PaySuccess", {
      state: {
        lastProductPath: `/product/${truck?.description?.replace(/\s+/g, "-").toLowerCase()}`,
        truck,
        fromCheckout: true
      }
    });
  };

  // Success handler for Cash/Check: show PaymentPending page and send slip
  const handlePendingSuccess = () => {
    sendSlip(user?.userid);
    navigate("/PaymentPending", {
      state: {
        lastProductPath: `/product/${truck?.description?.replace(/\s+/g, "-").toLowerCase()}`,
        truck,
        fromCheckout: true
      }
    });
  };

  // Fail handler: redirect to failed page
  const handleFail = () => {
    navigate("/PayFailed");
  };

  // Payment method routing
  if (paymentMethod === "Bank Transfer") {
    return <BankPay amount={totalPrice} onSuccess={handleSuccess} onFail={handleFail} />;
  }
  if (paymentMethod === "Installment") {
    return <InstallmentPay amount={totalPrice} onSuccess={handleSuccess} onFail={handleFail} />;
  }
  if (paymentMethod === "Cash Payment" || paymentMethod === "Check Payment") {
    // Directly show PaymentPending page and send slip
    useEffect(() => {
      if (!slipSent) handlePendingSuccess();
      // eslint-disable-next-line
    }, []);
    return <PaymentPending onRedirect={() => navigate(location.state?.lastProductPath || "/")} onCancel={() => navigate("/")} />;
  }
  if (location.pathname === "/PaySuccess") {
    return <PaySuccess onRedirect={() => navigate(location.state?.lastProductPath || "/")} onCancel={() => navigate("/")} />;
  }
  if (location.pathname === "/PayFailed") {
    return <PayFailed onRedirect={() => navigate("/InventoryNav")} onCancel={() => navigate("/")} />;
  }
  if (location.pathname === "/PaymentPending") {
    return <PaymentPending onRedirect={() => navigate(location.state?.lastProductPath || "/")} onCancel={() => navigate("/")} />;
  }
  return <div>Invalid payment method.</div>;
}