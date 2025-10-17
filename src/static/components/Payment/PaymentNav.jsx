import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BankPay from "./BankPay";
import InstallmentPay from "./InstallmentPay";
import PaySuccess from "./PaySuccess";
import PayFailed from "./PayFailed";
import PaymentPending from "./PaymentPending";

export default function PaymentNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const pendingOrder = JSON.parse(sessionStorage.getItem("pendingOrder") || "{}");

  // --- Extract order info ---
  const {
    paymentMethod = pendingOrder.paymentMethod,
    truck = pendingOrder.truck,
    user = pendingOrder.user,
    totalPrice = pendingOrder.totalPrice,
    color = pendingOrder.color,
    payload = pendingOrder.payload,
    lifting = pendingOrder.lifting,
    towing = pendingOrder.towing,
    transmission = pendingOrder.transmission,
    quantity = pendingOrder.quantity,
    unitPrice = pendingOrder.unitPrice,
    shipping = pendingOrder.shipping,
    shippingDate = pendingOrder.shippingDate,
  } = locationState;

  const [slipSent, setSlipSent] = useState(false);

  // --- Determine payment status based on method ---
  const pay_status =
    paymentMethod === "Bank Transfer"
      ? "paid"
      : paymentMethod === "Installment"
      ? "continuous"
      : "pending";

  // --- Create order ---
  const createOrder = async () => {
    if (!user || !truck) {
      throw new Error("Missing required user or truck data");
    }

    const orderData = {
      userId: user?.userid,
      username: user?.username,
      truck_model: truck?.model || truck?.description || "Unknown Model",
      base_price: truck?.basePrice || 0,
      body_color: color,
      payload_capacity: payload,
      lifting_capacity: lifting,
      towing_capacity: towing,
      transmission,
      unit_price: unitPrice,
      quantity,
      total_price: totalPrice,
      shipping_option: shipping,
      payment_method: paymentMethod,
      payment_status: pay_status,
      status: "Pending",
    };

    try {
      console.log("🧾 Sending orderData:", JSON.stringify(orderData, null, 2));
      const response = await fetch("/.netlify/functions/add_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create order: ${text}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error creating order:", error);
      throw error;
    }
  };

  // --- Send slip ---
  const sendSlip = async (orderUserId) => {
    try {
      const response = await fetch("/.netlify/functions/create_slip_scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: orderUserId || user?.userid }),
      });

      if (!response.ok) throw new Error("Failed to schedule slip sending");

      setSlipSent(true);
      console.log("✅ Slip scheduled successfully.");
    } catch (err) {
      console.error("❌ Failed to send slip:", err);
    }
  };

  // --- Handle successful payment ---
  const handleSuccess = async () => {
    try {
      const orderResult = await createOrder();
      await sendSlip(user?.userid);
      sessionStorage.removeItem("pendingOrder");

      console.log("✅ Payment success — redirecting to PaySuccess");

      navigate("/PaySuccess", {
        state: {
          truck,
          fromCheckout: true,
          orderId: orderResult.orderId,
        },
      });
    } catch (err) {
      console.error("❌ Payment success handler failed:", err);
      handleFail();
    }
  };

  // --- Handle failed payment ---
  const handleFail = () => {
    console.warn("⚠️ Payment failed — redirecting to PayFailed");
    navigate("/PayFailed");
  };

  // --- Handle Cash / Check payments (no online payment) ---
  const handlePendingPayment = async () => {
    try {
      const orderResult = await createOrder();
      await sendSlip(user?.userid);
      sessionStorage.removeItem("pendingOrder");

      console.log("💰 Pending payment — redirecting to PaymentPending");

      navigate("/PaymentPending", {
        state: {
          truck,
          fromCheckout: true,
          orderId: orderResult.orderId,
        },
      });
    } catch (err) {
      console.error("❌ Payment pending handler failed:", err);
      handleFail();
    }
  };

  // --- ROUTING LOGIC ---
  if (paymentMethod === "Bank Transfer") {
    return (
      <BankPay
        amount={Number(totalPrice)}
        onSuccess={handleSuccess}
        onFail={handleFail}
        user={user}
        truck={truck}
      />
    );
  }

  if (paymentMethod === "Installment") {
    return (
      <InstallmentPay
        amount={Number(totalPrice)}
        onSuccess={handleSuccess}
        onFail={handleFail}
        user={user}
        truck={truck}
      />
    );
  }

  if (paymentMethod === "Cash Payment" || paymentMethod === "Check Payment") {
    useEffect(() => {
      if (!slipSent) handlePendingPayment();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <PaymentPending
        onRedirect={() => navigate("/InventoryNav")}
        onCancel={() => navigate("/")}
      />
    );
  }

  console.log("⚙️ DEBUG PaymentNav State:", location.state);
  return <div>Invalid or missing payment method.</div>;
}
