// src/components/TruckOrderForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";
import "./TruckOrderForm.css";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

  // --- Slip generation helpers ---
  const generateSlipNumber = () => {
    // SLIP-2025-0001 style: random 4 digits for now
    const n = Math.floor(Math.random() * 10000);
    return `SLIP-2025-${String(n).padStart(4, "0")}`;
  };

  const ensureSlip = () => {
    let slip = sessionStorage.getItem("currentSlipNumber");
    if (!slip) {
      slip = generateSlipNumber();
      sessionStorage.setItem("currentSlipNumber", slip);
    }
    return slip;
  };

  const addOrderToSession = (orderPayload) => {
    const slip = ensureSlip();

    const sanitizeTruck = (t) => {
      if (!t) return null;
      return {
        id: t.id || t.orderableId || null,
        model: t.model || t.description || null,
        thumbnail: t.thumbnail || null,
        basePrice: t.basePrice || t.base_price || 0,
      };
    };

    const sanitizeUser = (u) => {
      if (!u) return null;
      return {
        userid: u.userid || u.id || null,
        username: u.username || `${u.first_name || ""} ${u.last_name || ""}`.trim() || null,
        first_name: u.first_name || null,
        last_name: u.last_name || null,
        email_address: u.email_address || null,
        phone_number: u.phone_number || null,
        home_address: u.home_address || null,
      };
    };

    try {
      const multiRaw = sessionStorage.getItem("multiOrders") || "[]";
      const multi = JSON.parse(multiRaw);

      const orderWithSlip = {
        ...orderPayload,
        truck: sanitizeTruck(orderPayload.truck),
        user: sanitizeUser(orderPayload.user),
        transaction_number: slip,
      };

      multi.push(orderWithSlip);
      sessionStorage.setItem("multiOrders", JSON.stringify(multi));
      // notify same-tab listeners (CartButton listens for this)
      try { window.dispatchEvent(new Event("ordersUpdated")); } catch (e) {}
      return { slip, multi };
    } catch (err) {
      console.error("Failed to save order to sessionStorage:", err);
      // fallback: try storing a minimal order entry
      try {
        const fallback = [
          {
            user: sanitizeUser(orderPayload.user),
            truck: {
              model: orderPayload.truck?.model || orderPayload.truck?.description || null,
            },
            quantity: orderPayload.quantity || 1,
            totalPrice: orderPayload.totalPrice || orderPayload.total_price || 0,
            transaction_number: slip,
          },
        ];
        sessionStorage.setItem("multiOrders", JSON.stringify(fallback));
        try { window.dispatchEvent(new Event("ordersUpdated")); } catch (e) {}
        return { slip, multi: fallback };
      } catch (e) {
        console.error("Fallback save failed:", e);
        return { slip, multi: [] };
      }
    }
  };

  // lock background scroll when any modal is open
  useEffect(() => {
    if (showConfirmation || showAuthPrompt) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showConfirmation, showAuthPrompt]);

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

    // Save current order into multiOrders and go to OTP (old behavior)
    // Updated flow: store to session multiOrders then redirect to OTP only when user clicks Finalize Order
    // Here we'll save as pending single order for compatibility — but primary flow uses addOrderToSession/finalize below
    sessionStorage.setItem("pendingOrder", JSON.stringify(orderDetails));

    setSending(true);
    setShowConfirmation(false);

    // keep backward compatibility: do not navigate here by default
    // navigate("/OtpVerificationPage");
  };

  const handlePlaceAnotherOrder = () => {
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
    const { slip, multi } = addOrderToSession(orderDetails);
    // redirect user back to inventory to pick another truck
    setShowConfirmation(false);
    navigate("/InventoryNav");

    // Notify user with toast and show current multiOrders content (pretty column summary)
    try {
      toast.success("Product added to multi-orders list successfully");

      const currentMulti = sessionStorage.getItem("multiOrders") || "[]";
      const parsed = JSON.parse(currentMulti);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.info("Multi-orders updated. Open your orders list to review.");
        return;
      }

      const content = (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 280 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Multi-Orders ({parsed.length})
          </div>
          {parsed.map((o, idx) => {
            const model = o.truck?.model || o.truck?.description || "Unknown model";
            const qty = o.quantity ?? 1;
            const unit = o.unitPrice ?? o.unit_price ?? 0;
            const total = o.totalPrice ?? o.total_price ?? unit * qty;
            const slipNum = o.transaction_number || slip || "N/A";
            return (
              <div
                key={`${slipNum}-${idx}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span style={{ fontWeight: 600 }}>{idx + 1}. {model}</span>
                <span style={{ fontSize: 13, color: "#333" }}>
                  Qty: {qty} · Unit: ₱{Number(unit).toLocaleString()} · Total: ₱{Number(total).toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: "#666" }}>Slip: {slipNum}</span>
              </div>
            );
          })}
          <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
            Open your orders list to review or finalize.
          </div>
        </div>
      );

      toast.info(content, { autoClose: 10000 });
    } catch (err) {
      // fallback simple message if anything goes wrong
      toast.info("Multi-orders updated. Open your orders list to review.");
    }
  };

  const handleFinalizeOrder = () => {
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
    addOrderToSession(orderDetails);
    setShowConfirmation(false);
    // set a single pendingOrder for any legacy code (PaymentNav has been updated to read multiOrders)
    sessionStorage.setItem("pendingOrder", JSON.stringify(orderDetails));

    // ensure OTP flow knows where to redirect after verification (match CartButton)
    try {
      sessionStorage.setItem("postOtpRedirect", "/PaymentNav");
      const pm = orderDetails.paymentMethod || orderDetails.payment || "Bank Transfer";
      sessionStorage.setItem("postOtpPaymentMethod", pm);
    } catch (e) {
      console.error("Failed to persist post-OTP redirect/payment method:", e);
    }

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
      // fallback: close the auth modal and return to last opened product page
      const redirect =
        sessionStorage.getItem("postAuthRedirect") || location?.pathname || "/";
      setShowAuthPrompt(false);
      navigate(redirect);
    }
    catch (error) {
    console.error("Error opening auth modal:", error);
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
        
        <div
          className="modal-overlay truck-order-confirmation"
          role="dialog"
          aria-modal="true"
        >
          
          <div className="truck-order-confirmation-box modal-content">
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
                className="Place-new-order-button"
                onClick={handlePlaceAnotherOrder}
              >
                Place Another Order
              </button>

              <button
                type="button"
                className="Place-order-button"
                onClick={handleFinalizeOrder}
                disabled={sending}
              >
                Finalize Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Auth prompt modal shown when user clicks Checkout while not logged in === */}
      {showAuthPrompt && (
        <div className="modal-overlay auth-prompt-modal" role="dialog" aria-modal="true">
          <div className="auth-prompt-box modal-content">
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
