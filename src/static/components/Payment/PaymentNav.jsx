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
  // Read multiOrders (array) and slip from sessionStorage
  const multiOrders = JSON.parse(sessionStorage.getItem("multiOrders") || "[]");
  const transactionNumber = sessionStorage.getItem("currentSlipNumber") || null;
  const pendingOrder = JSON.parse(sessionStorage.getItem("pendingOrder") || "{}");

  // determine primary paymentMethod: prefer location state -> pendingOrder -> first multiOrder
  const paymentMethod =
    locationState.paymentMethod ||
    pendingOrder.paymentMethod ||
    (multiOrders[0] && multiOrders[0].paymentMethod) ||
    "Bank Transfer";

  // pick representative truck/user/totalPrice for UI components that expect single values
  const truck =
    locationState.truck || pendingOrder.truck || (multiOrders[0] && multiOrders[0].truck) || null;
  const user =
    locationState.user || pendingOrder.user || (multiOrders[0] && multiOrders[0].user) || null;
  const totalPrice =
    locationState.totalPrice ||
    pendingOrder.totalPrice ||
    multiOrders.reduce((s, o) => s + (o.totalPrice || 0), 0) ||
    0;
  const color =
    locationState.color || pendingOrder.color || (multiOrders[0] && multiOrders[0].color) || null;
  const payload =
    locationState.payload || pendingOrder.payload || (multiOrders[0] && multiOrders[0].payload) || null;
  const lifting =
    locationState.lifting || pendingOrder.lifting || (multiOrders[0] && multiOrders[0].lifting) || null;
  const towing =
    locationState.towing || pendingOrder.towing || (multiOrders[0] && multiOrders[0].towing) || null;
  const transmission =
    locationState.transmission ||
    pendingOrder.transmission ||
    (multiOrders[0] && multiOrders[0].transmission) ||
    null;
  const quantity =
    locationState.quantity || pendingOrder.quantity || (multiOrders[0] && multiOrders[0].quantity) || 1;
  const unitPrice =
    locationState.unitPrice || pendingOrder.unitPrice || (multiOrders[0] && multiOrders[0].unitPrice) || 0;
  const shipping =
    locationState.shipping || pendingOrder.shipping || (multiOrders[0] && multiOrders[0].shipping) || null;
  const shippingDate =
    locationState.shippingDate ||
    pendingOrder.shippingDate ||
    (multiOrders[0] && multiOrders[0].shippingDate) ||
    null;

  const [slipSent, setSlipSent] = useState(false);

  // pay_status logic remains similar; when there are multiple orders across methods this is a simplification
  const pay_status =
    paymentMethod === "Bank Transfer"
      ? "paid"
      : paymentMethod === "Installment"
      ? "continuous"
      : "pending";

  // --- Create order(s) ---
  const createOrder = async () => {
    // choose orders array: multiOrders if present, otherwise use single order from location/pending
    const ordersToCreate = multiOrders.length > 0 ? multiOrders : [pendingOrder];
    if (!ordersToCreate || ordersToCreate.length === 0) {
      throw new Error("No orders to create");
    }

    try {
      const createdOrderIds = [];

      for (const o of ordersToCreate) {
        if (!o.user || !o.truck) {
          console.warn("Skipping invalid order missing user/truck:", o);
          continue;
        }

        const orderData = {
          userId: o.user?.userid,
          username: o.user?.username,
          truck_model: o.truck?.model || o.truck?.description || "Unknown Model",
          base_price: o.truck?.basePrice || o.base_price || 0,
          body_color: o.color,
          payload_capacity: o.payload,
          lifting_capacity: o.lifting,
          towing_capacity: o.towing,
          transmission: o.transmission,
          unit_price: o.unitPrice,
          quantity: o.quantity,
          total_price: o.totalPrice,
          shipping_option: o.shipping,
          shippingDate: o.shippingDate,
          payment_method: o.paymentMethod,
          payment_status: pay_status,
          status: "Pending",
          transaction_number: transactionNumber,
        };

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

        const json = await response.json();
        createdOrderIds.push(json?.orderId || null);
      }

      return createdOrderIds;
    } catch (error) {
      console.error("❌ Error creating orders:", error);
      throw error;
    }
  };

  // --- Send slip (now includes transaction number) ---
  const sendSlip = async (orderUserId) => {
    try {
      const response = await fetch("/.netlify/functions/create_slip_scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: orderUserId || user?.userid, transaction_number: transactionNumber }),
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
      const orderIds = await createOrder();
      await sendSlip(user?.userid);

      // clear multiOrders and slip after successful creation
      sessionStorage.removeItem("multiOrders");
      sessionStorage.removeItem("currentSlipNumber");
      sessionStorage.removeItem("pendingOrder");

      console.log("✅ Payment success — redirecting to PaySuccess");

      navigate("/PaySuccess", {
        state: {
          orders: multiOrders.length > 0 ? multiOrders : [pendingOrder],
          fromCheckout: true,
          orderIds,
          transaction_number: transactionNumber,
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
    navigate("/PayFailed", {
      state: { transaction_number: transactionNumber, orders: multiOrders.length > 0 ? multiOrders : [pendingOrder] },
    });
  };

  // --- Handle Cash / Check payments (no online payment) ---
  const handlePendingPayment = async () => {
    try {
      const orderIds = await createOrder();
      await sendSlip(user?.userid);

      // clear after scheduling
      sessionStorage.removeItem("multiOrders");
      sessionStorage.removeItem("currentSlipNumber");
      sessionStorage.removeItem("pendingOrder");

      console.log("💰 Pending payment — redirecting to PaymentPending");

      navigate("/PaymentPending", {
        state: {
          orders: multiOrders.length > 0 ? multiOrders : [pendingOrder],
          fromCheckout: true,
          orderIds,
          transaction_number: transactionNumber,
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
        transaction_number={transactionNumber}
        orders={multiOrders}
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
        transaction_number={transactionNumber}
        orders={multiOrders}
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
        transaction_number={transactionNumber}
        orders={multiOrders}
      />
    );
  }

  console.log("⚙️ DEBUG PaymentNav State:", location.state);
  return <div>Invalid or missing payment method.</div>;
}
