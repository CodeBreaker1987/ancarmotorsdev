import React, { useState, useRef, useEffect } from "react";
import emailjs from "emailjs-com";
import { useUser } from "../../Context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import "./TruckOrderForm.css";

const SHIPPING = [
  { label: "Standard (1-4 days)", value: "Standard (1-4 days)" },
  { label: "Express (1-2 days)", value: "Express (1-2 days)" },
  { label: "Select Date", value: "date" },
];

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash Payment",
  "Check Payment",
  "Loan or Installment",
];

const today = new Date().toISOString().split("T")[0];

const SITE_URL = process.env.SITE_URL || "https://ancarmotorsdev.netlify.app"; // or your domain

export default function TruckOrderForm({ truck, basePrice = 0, onOrderPlaced, onOpenOverlay, onOpenRegister }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { user } = useUser(); // logged-in user from PostgreSQL
  const [color, setColor] = useState("");
  const [payload, setPayload] = useState("");
  const [lifting, setLifting] = useState("");
  const [towing, setTowing] = useState("");
  const [transmission, setTransmission] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState(SHIPPING[0].value);
  const [shippingDate, setShippingDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sending, setSending] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false); // NEW: Success popup
  const formRef = useRef();
  const navigate = useNavigate();

  // Reset form when truck changes
  useEffect(() => {
    if (truck) {
      setColor(truck.specifications.colors?.[0] || "");
      setPayload(truck.specifications?.PayloadCapacity?.[0]?.label || "");
      setTransmission(truck.specifications?.Transmissions?.[0]?.label || "");
      setLifting(truck.specifications?.LiftingCapacity?.[0]?.label || "N/A");
      setTowing(truck.specifications?.TowingCapacity?.[0]?.label || "N/A");
      setQuantity(1);
      setShipping(SHIPPING[0].value);
      setShippingDate("");
      setPaymentMethod("Bank Transfer");
    }
  }, [truck]);

  const payloadPrice =
    truck.specifications?.PayloadCapacity?.find((p) => p.label === payload)
      ?.priceModifier || 0;

  const transmissionPrice =
    truck.specifications?.Transmissions?.find((t) => t.label === transmission)
      ?.priceModifier || 0;

  const liftingPrice =
    truck.specifications?.LiftingCapacity?.find((u) => u.label === lifting)
      ?.priceModifier || 0;

  const towingPrice =
    truck.specifications?.TowingCapacity?.find((v) => v.label === towing)
      ?.priceModifier || 0;

  const unitPrice =
    (truck.basePrice || basePrice) +
    payloadPrice +
    transmissionPrice +
    liftingPrice +
    towingPrice;

  const totalPrice = unitPrice * quantity;

  const validateForm = () => {
  if (!color) {
    alert("Please select a body color.");
    return false;
  }
  if (!payload) {
    alert("Please select a payload capacity.");
    return false;
  }
  if (!transmission) {
    alert("Please select a transmission type.");
    return false;
  }
  if (!paymentMethod) {
    alert("Please select a payment method.");
    return false;
  }
  if (shipping === "date" && !shippingDate) {
    alert("Please select a shipping date.");
    return false;
  }
  return true; // ✅ all good
};

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails
    if (!user) {
      setShowAuthPrompt(true); // Show auth prompt first
      return;
    }
    setShowConfirmation(true);   // ✅ Only show confirmation if valid
  };

  // Store order details in sessionStorage for OTP/payment flow
  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    // For Bank Transfer or Loan/Installment, redirect to OTP Verification first
    if (["Bank Transfer", "Loan or Installment"].includes(paymentMethod)) {
      setShowConfirmation(false);

      // Store order details in sessionStorage for retrieval after OTP
      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          truck,
          color,
          payload,
          lifting,
          towing,
          transmission,
          quantity,
          unitPrice,
          totalPrice,
          shipping,
          shippingDate,
          paymentMethod,
          user,
        })
      );

      // Go to OTP verification page
      navigate("/OTPVerificationPage");
      return;
    }

    setSending(true);

    const SERVICE_ID = "service_hhwzshz";
    const TEMPLATE_ID = "template_s6685d8";
    const USER_ID = "OMnRruT1S-TVzXGJ-";

    try {
      // Step 1️⃣ Save the order to your DB
      const orderData = {
        userId: user.userid,
        username: user.username,
        truck_model: truck.description || truck.model,
        body_color: color,
        payload_capacity: payload,
        towing_capacity: towing,
        lifting_capacity: lifting,
        transmission: transmission,
        quantity: quantity,
        base_price: unitPrice,
        total_price: totalPrice,
        shipping_option: shipping === "date" ? shippingDate : shipping,
        payment_method: paymentMethod,
        status: "Pending",
      };

      const orderResponse = await fetch("/.netlify/functions/add_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderResult.error || "Failed to save order");

      // Step 2️⃣ Handle PayMongo checkout for banking or card methods
      if (["Bank Transfer", "GCash", "Card"].includes(paymentMethod)) {
        // Prepare the payload for PayMongo Checkout API
        const payload = {
          data: {
            attributes: {
              billing: {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email_address,
                phone: user.phone_number,
              },
              amount: totalPrice * 100, // PayMongo expects centavos
              description: `Truck Order - ${truck.description || truck.model}`,
              redirect: {
                success: `${SITE_URL}/paymongo-success`,
                failed: `${SITE_URL}/paymongo-fail`
              },
              type: "payment",
              currency: "PHP"
            }
          }
        };

        // Call your Netlify function to create a checkout session
        const paymongoResponse = await fetch("/.netlify/functions/create_checkout_session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const paymongoResult = await paymongoResponse.json();
        if (!paymongoResponse.ok) throw new Error(paymongoResult.error || "Failed to create PayMongo checkout session");

        // Redirect user to PayMongo checkout
        window.location.href = paymongoResult.checkoutUrl;
        return;
      }

      // Step 3️⃣ Otherwise, send email confirmation for non-online payments
      const emailParams = {
        orderid: orderResult.order?.orderid || "N/A",
        truck_model: truck.description || truck.model,
        body_color: color,
        payload_capacity: payload,
        towing_capacity: towing,
        lifting_capacity: lifting,
        transmission: transmission,
        quantity: quantity,
        base_price: unitPrice,
        total_price: totalPrice,
        shipping_option: shipping === "date" ? shippingDate : shipping,
        payment_method: paymentMethod,
        customer_name: `${user.first_name} ${user.last_name}`,
        customer_email: user.email_address,
        customer_address: user.home_address,
        customer_phone: user.phone_number,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, USER_ID);

      setShowConfirmation(false);
      setShowOrderSuccess(true);
      if (onOrderPlaced) onOrderPlaced({ truck, customer: user, totalPrice });

    } catch (err) {
      console.error("Place order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setSending(false);
    }
  };


  if (!truck) return <p>Please select a truck from the inventory to order.</p>;

  return (
    <div className="truck-order-form">
      <h3>Price Per Unit: ₱{unitPrice.toLocaleString()}</h3>
      <h2>Total Price: ₱{totalPrice.toLocaleString()}</h2>

      <form onSubmit={handleCheckout}>
        <fieldset>
          <legend>Specifications</legend>
          {/* Colors */}
          {truck.specifications.colors?.length > 0 && (
            <div style={{ marginBottom: 2 }}>
              <label style={{ display: "block", marginBottom: 8 }}>Body Color:</label>
              <div style={{ display: "flex", gap: "15px" }}>
                {truck.specifications.colors.map((c) => (
                  <label
                    key={c}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    {/* Hidden radio input */}
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      checked={color === c}
                      onChange={() => setColor(c)}
                      style={{ display: "none" }}
                    />

                    {/* Color circle */}
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: c,
                        border: color === c ? "3px solid #000" : "1px solid #ccc",
                        display: "inline-block",
                        transition: "border 0.2s",
                      }}
                    ></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payload */}
          {truck.specifications?.PayloadCapacity?.length > 0 && (
            <div>
              <label>Payload Capacity:</label>
              {truck.specifications.PayloadCapacity.map((p) => (
                <label key={p.label} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="payload"
                    value={p.label}
                    checked={payload === p.label}
                    onChange={() => setPayload(p.label)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          )}

          {/* Lifting Capacity */}
          {truck.specifications?.LiftingCapacity?.length > 0 && (
            <div>
              <label>Lifting Capacity:</label>
              {truck.specifications.LiftingCapacity.map((u) => (
                <label key={u.label} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="lifting"
                    value={u.label}
                    checked={lifting === u.label}
                    onChange={() => setLifting(u.label)}
                  />
                  {u.label}
                </label>
              ))}
            </div>
          )}

          {/* Towing */}
          {truck.specifications?.TowingCapacity?.length > 0 && (
            <div>
              <label>Towing Capacity:</label>
              {truck.specifications.TowingCapacity.map((v) => (
                <label key={v.label} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="towing"
                    value={v.label}
                    checked={towing === v.label}
                    onChange={() => setTowing(v.label)}
                  />
                  {v.label}
                </label>
              ))}
            </div>
          )}

          {/* Transmission */}
          {truck.specifications?.Transmissions?.length > 0 && (
            <div>
              <label>Transmission Type:</label>
              {truck.specifications.Transmissions.map((t) => (
                <label key={t.label} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="transmission"
                    value={t.label}
                    checked={transmission === t.label}
                    onChange={() => setTransmission(t.label)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="UnitQuantity">
            <label>
              Quantity of Units:
              <div style={{ display: "flex", alignItems: "center" }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  ▼
                </button>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={quantity}
                  readOnly
                  style={{ width: 50, textAlign: "center", marginRight: 10 }}
                />
                <button type="button" onClick={() => setQuantity(Math.min(5, quantity + 1))}>
                  ▲
                </button>
              </div>
            </label>
          </div>

          {/* Shipping */}
          <div>
            <label>Shipping Option:</label>
            {SHIPPING.map((s) => (
              <label key={s.value} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="shipping"
                  value={s.value}
                  checked={shipping === s.value}
                  onChange={() => setShipping(s.value)}
                />
                {s.label}
              </label>
            ))}
            {shipping === "date" && (
              <input
                type="date"
                min={today}
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
                style={{ marginLeft: 10 }}
              />
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <label>Payment Method:</label>
            {PAYMENT_METHODS.map((method) => (
              <label key={method} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="payment_method"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="Checkoutbutton">
          Checkout
        </button>
      </form>

      {/* Auth Prompt for unauthenticated users */}
      {showAuthPrompt && (
        <div className="truck-order-confirmation">
          <div className="truck-order-confirmation-box">
            <button
              type="button"
              className="authprompt-popup-cancel"
              onClick={() => setShowAuthPrompt(false)}
            >
              ×
            </button>
            <h2>Interested in this product?</h2>
            <p>Sign Up or Login first before placing the order.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <button
                type="button" className="SignIn-button"
                onClick={() => {
                  setShowAuthPrompt(false);
                  window.dispatchEvent(
                    new CustomEvent("openOverlay", {
                      detail: {
                        view: "customer",
                        fromCheckout: true,
                        productPath: window.location.pathname,
                        productState: { truck },
                      },
                    })
                  );
                }}
                style={{ fontWeight: "bold", fontSize: 18 }}
              >
                SIGN IN
              </button>
              <button
                type="button" className="SignUp-button"
                onClick={() => {
                  setShowAuthPrompt(false);
                  window.dispatchEvent(
                    new CustomEvent("openOverlay", {
                      detail: {
                        view: "register",
                        fromCheckout: true,
                        productPath: window.location.pathname,
                        productState: { truck },
                      },
                    })
                  );
                }}
                style={{ fontWeight: "bold", fontSize: 18 }}
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Popup */}
      {showConfirmation && (
        <div className="truck-order-confirmation">
          <div className="truck-order-confirmation-box">
            <button
              type="button"
              className="truck-order-popup-cancel"
              onClick={() => setShowConfirmation(false)}
            >
              ×
            </button>

            <h1>Order Confirmation</h1>
            <div className="truck-specs">
              <h3>Selected Specifications:</h3>
              <ol>
                <p><b>Model:</b> {truck.description || truck.model}</p>
                <p><b>Color:</b> {color}</p>
                <p><b>Payload:</b> {payload}</p>
                <p><b>Lifting Capacity:</b> {lifting || "N/A"}</p>
                <p><b>Towing Capacity:</b> {towing || "N/A"}</p>
                <p><b>Transmission:</b> {transmission}</p>
                <p><b>Quantity:</b> {quantity}</p>
              </ol>
            </div>

            {/* Payment & Shipping */}
            <div className="payment-shipping">
              <h3>Payment & Shipping:</h3>
              <ol>
                <p><b>Payment Method:</b> {paymentMethod}</p>
                <p><b>Shipping Option:</b> {shipping === "date" ? shippingDate : shipping}</p>
              </ol>
            </div>

            {/* Customer Info */}
            <div className="customer-info">
              <h3>Customer Information:</h3>
              <ol>
                <p><b>Full Name:</b> {user?.first_name} {user?.last_name}</p>
                <p><b>Home Address:</b> {user?.home_address}</p>
                <p><b>Email:</b> {user?.email_address}</p>
                <p><b>Phone Number:</b> {user?.phone_number}</p>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              <button type="button" className="Change-order-button" onClick={() => setShowConfirmation(false)}>
                Change Order
              </button>
              <button type="button" className="Place-order-button" onClick={handlePlaceOrder} disabled={sending}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup after placing order */}
      {showOrderSuccess && (
        <div className="truck-order-success-popup">
          <div className="truck-order-success-box">
            <h2>Order Placed Successfully!</h2>
            <p>Your order has been placed. Please check your email for the invoice and confirmation.</p>
            <button type="button" onClick={() => setShowOrderSuccess(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
