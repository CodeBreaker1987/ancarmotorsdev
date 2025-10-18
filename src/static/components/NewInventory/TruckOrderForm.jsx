// src/components/TruckOrderForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";
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
  "Installment",
];

const today = new Date().toISOString().split("T")[0];

export default function TruckOrderForm({
  truck,
  basePrice = 0,
  onOpenOverlay,
  showOrderSuccess,
  setShowOrderSuccess,
}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [sending, setSending] = useState(false);

  const formRef = useRef();

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
    if (!color) return alert("Please select a body color.");
    if (!payload) return alert("Please select a payload capacity.");
    if (!transmission) return alert("Please select a transmission type.");
    if (!paymentMethod) return alert("Please select a payment method.");
    if (shipping === "date" && !shippingDate)
      return alert("Please select a shipping date.");
    return true;
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setShowConfirmation(true);
  };

  // 🧩 New version: redirect to OTP verification first
  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    const orderDetails = {
      user,
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
    };

    // Store pending order temporarily for OTP verification
    sessionStorage.setItem("pendingOrder", JSON.stringify(orderDetails));

    setSending(true);
    setShowConfirmation(false);

    // Navigate to OTP page instead of PaymentNav
    navigate("/OtpVerificationPage");
  };

  // new helper: open signin/signup and remember return path
  const openAuthAndRemember = (mode) => {
    try {
      // remember current product page so auth flow can return here
      const returnPath = location?.pathname || window.location.pathname;
      sessionStorage.setItem("postAuthRedirect", returnPath);
      // also store minimal product identifier so UI can restore if needed
      if (truck?.id || truck?.orderableId || truck?.model) {
        sessionStorage.setItem(
          "postAuthProduct",
          JSON.stringify({ id: truck.id, model: truck.model || truck.description })
        );
      }
      // prefer provided overlay handler if available (keeps existing navbar behavior)
      if (typeof onOpenOverlay === "function") {
        onOpenOverlay(mode === "signin" ? "signin" : "signup");
      }
      // navigate to auth pages as fallback
      if (mode === "signin") navigate("/login", { state: { from: returnPath } });
      else navigate("/register", { state: { from: returnPath } });
    } catch (e) {
      // fallback simple navigate
      if (mode === "signin") navigate("/login");
      else navigate("/register");
    }
  };

  if (!truck) return <p>Please select a truck from the inventory to order.</p>;

  return (
    <div className="truck-order-form">
      <h3>Price Per Unit: ₱{unitPrice.toLocaleString()}</h3>
      <h2>Total Price: ₱{totalPrice.toLocaleString()}</h2>

      <form onSubmit={handleCheckout} ref={formRef}>
        <fieldset>
          <legend>Specifications</legend>

          {/* Color */}
          {truck.specifications.colors?.length > 0 && (
            <div style={{ marginBottom: 2 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Body Color:
              </label>
              <div style={{ display: "flex", gap: "15px" }}>
                {truck.specifications.colors.map((c) => (
                  <label key={c} style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      checked={color === c}
                      onChange={() => setColor(c)}
                      style={{ display: "none" }}
                    />
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

          {/* Lifting */}
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
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
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
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(5, quantity + 1))}
                >
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

          {/* Payment */}
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

      {/* Confirmation modal */}
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
              <p><b>Model:</b> {truck.description || truck.model}</p>
              <p><b>Color:</b> {color}</p>
              <p><b>Payload:</b> {payload}</p>
              <p><b>Lifting:</b> {lifting}</p>
              <p><b>Towing:</b> {towing}</p>
              <p><b>Transmission:</b> {transmission}</p>
              <p><b>Quantity:</b> {quantity}</p>
            </div>

            <div className="payment-shipping">
              <h3>Payment & Shipping:</h3>
              <p><b>Payment:</b> {paymentMethod}</p>
              <p><b>Shipping:</b> {shipping === "date" ? shippingDate : shipping}</p>
            </div>

            <div className="customer-info">
              <h3>Customer Information:</h3>
              <p><b>Name:</b> {user?.first_name} {user?.last_name}</p>
              <p><b>Address:</b> {user?.home_address}</p>
              <p><b>Email:</b> {user?.email_address}</p>
              <p><b>Phone:</b> {user?.phone_number}</p>
            </div>

            <div className="order-actions">
              <button
                type="button"
                className="Change-order-button"
                onClick={() => setShowConfirmation(false)}
              >
                Change Order
              </button>
              <button
                type="button"
                className="Place-order-button"
                onClick={handlePlaceOrder}
                disabled={sending}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Auth prompt modal shown when user clicks Checkout while not logged in === */}
      {showAuthPrompt && (
        <div className="auth-prompt-modal">
          <div className="auth-prompt-box">
            <button
              type="button"
              className="auth-prompt-close"
              onClick={() => setShowAuthPrompt(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>Interested in this Product?</h2>
            <p>Sign in or Sign Up to place an order.</p>

            <div className="auth-actions">
              <button
                type="button"
                className="auth-signin-button"
                onClick={() => openAuthAndRemember("signin")}
              >
                Sign In
              </button>

              <button
                type="button"
                className="auth-signup-button"
                onClick={() => openAuthAndRemember("signup")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
