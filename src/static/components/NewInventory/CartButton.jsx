import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CartButton.css";

const MULTI_KEY = "multiOrders";
const FALLBACK_KEY = "orders"; // keep backward compatibility

const readOrders = () => {
  try {
    const raw = sessionStorage.getItem(MULTI_KEY) || sessionStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders) => {
  try {
    sessionStorage.setItem(MULTI_KEY, JSON.stringify(orders));
    // also update fallback key for compatibility with any older code
    sessionStorage.setItem(FALLBACK_KEY, JSON.stringify(orders));
    // notify same-tab listeners
    window.dispatchEvent(new Event("ordersUpdated"));
  } catch (err) {
    console.error("writeOrders error", err);
  }
};

// determine logged-in state by probing common storage keys
const readIsLoggedIn = () => {
  try {
    const probeKeys = [
      "user",
      "currentUser",
      "authUser",
      "token",
      "authToken",
      "accessToken",
      "isLoggedIn",
    ];
    for (const k of probeKeys) {
      const v = sessionStorage.getItem(k) ?? localStorage.getItem(k);
      if (!v) continue;
      if (k === "isLoggedIn") {
        const normalized = v.toLowerCase();
        if (normalized === "1" || normalized === "true") return true;
        if (normalized === "0" || normalized === "false") return false;
      } else {
        // if it's JSON "null" treat as not logged in
        if (v === "null") continue;
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState(readOrders());
  const [expandedIndexes, setExpandedIndexes] = useState([]); // indexes of expanded items
  const [loggedIn, setLoggedIn] = useState(readIsLoggedIn());
  const popupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // keep in sync with sessionStorage changes (other tabs)
    const onStorage = () => {
      setOrders(readOrders());
      setLoggedIn(readIsLoggedIn());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    // keep in sync with same-tab updates via custom events
    const onSessionUpdate = () => setOrders(readOrders());
    const onAuthUpdate = () => setLoggedIn(readIsLoggedIn());
    window.addEventListener("ordersUpdated", onSessionUpdate);
    window.addEventListener("authUpdated", onAuthUpdate);
    return () => {
      window.removeEventListener("ordersUpdated", onSessionUpdate);
      window.removeEventListener("authUpdated", onAuthUpdate);
    };
  }, []);

  // refresh orders whenever the popup is opened
  useEffect(() => {
    if (open) {
      setOrders(readOrders());
      setExpandedIndexes([]); // collapse all when opening
    }
  }, [open]);

  useEffect(() => {
    // click outside to close
    const onClick = (e) => {
      if (!open) return;
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !e.target.classList.contains("cartButton")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  const isExpanded = (idx) => expandedIndexes.includes(idx);
  const toggleExpand = (idx) => {
    setExpandedIndexes((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      return [...prev, idx];
    });
  };

  const removeAt = (idx) => {
    const next = orders.filter((_, i) => i !== idx);
    setOrders(next);
    writeOrders(next);
    // also adjust expanded indexes
    setExpandedIndexes((prev) => prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)));
  };

  const removeAll = () => {
    if (!orders.length) return;
    if (!window.confirm("Remove all items from the cart?")) return;
    setOrders([]);
    writeOrders([]);
    setExpandedIndexes([]);
  };

  const handleCheckout = () => {
    if (!orders.length) {
      window.alert("No items in cart to checkout.");
      return;
    }

    // take the last order as the one to finalize (same behavior as TruckOrderForm.finalize)
    const last = orders[orders.length - 1] || {};

    // ensure there's a slip/transaction number
    let slip = last.transaction_number || last.transaction || last.transactionNo || last.transactionNumber;
    if (!slip) {
      const year = new Date().getFullYear();
      slip = `SLIP-${year}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
      // persist current slip for other code that may read it
      try {
        sessionStorage.setItem("currentSlipNumber", slip);
      } catch (e) {}
      // attach to the last order copy so pendingOrder contains it
      last.transaction_number = slip;
    }

    // persist pendingOrder (legacy expectation), ensure multiOrders kept in sessionStorage
    try {
      sessionStorage.setItem("pendingOrder", JSON.stringify(last));
      sessionStorage.setItem("multiOrders", JSON.stringify(orders));
      sessionStorage.setItem("postOtpRedirect", "/PaymentNav");
      const pm = last.paymentMethod || last.payment || last.payment_method || "Bank Transfer";
      sessionStorage.setItem("postOtpPaymentMethod", pm);
      try { window.dispatchEvent(new Event("ordersUpdated")); } catch (e) {}
    } catch (err) {
      console.error("Error preparing pending order for checkout:", err);
    }

    setOpen(false);
    navigate("/OtpVerificationPage");
  };

  const formatMoney = (val) => {
    if (val == null || Number.isNaN(Number(val))) return "-";
    return `₱${Number(val).toLocaleString()}`;
  };

  const renderDetails = (order) => {
    const title =
      order?.truck?.model ||
      order?.truck?.description ||
      order?.truck?.orderableId ||
      order?.description ||
      order?.title ||
      "Unnamed item";

    const unitPrice =
      order?.unitPrice ??
      order?.unit_price ??
      order?.truck?.basePrice ??
      order?.basePrice ??
      null;

    const quantity = order?.quantity ?? order?.qty ?? 1;

    const total =
      order?.totalPrice ?? order?.total_price ?? (unitPrice != null ? unitPrice * quantity : null);

    // common option fields (attempt many possible property names)
    const color =
      order?.color ||
      order?.options?.color ||
      order?.selected?.color ||
      (order?.truck && order.truck.color) ||
      "-";
    const transmission =
      order?.transmission ||
      order?.options?.transmission ||
      order?.selected?.transmission ||
      "-";
    const payload =
      order?.payload || order?.options?.payload || order?.specs?.payload || "-";
    const lifting =
      order?.lifting || order?.options?.lifting || order?.specs?.lifting || "-";
    const towing =
      order?.towing || order?.options?.towing || order?.specs?.towing || "-";
    const shipping = order?.shipping || order?.shippingMethod || order?.delivery || "-";
    const payment = order?.paymentMethod || order?.payment || "-";
    const txn = order?.transaction_number || order?.transactionNumber || order?.transaction || order?.transactionNo || "-";
    const notes = order?.notes || order?.note || order?.payloadNotes || "-";

    const rows = [
      ["Item", title],
      ["Model", order?.truck?.model || order?.truck?.orderableId || "-"],
      ["Quantity", quantity],
      ["Unit price", formatMoney(unitPrice)],
      ["Total", formatMoney(total)],
      ["Color", color],
      ["Transmission", transmission],
      ["Payload", payload],
      ["Lifting", lifting],
      ["Towing", towing],
      ["Shipping", shipping],
      ["Payment", payment],
      ["Transaction #", txn],
      ["Notes", notes],
    ];

    return (
      <div className="cartItemDetails" style={{ background: "#f8fafc", border: "1px solid #eef2f7", padding: 10, borderRadius: 6, maxHeight: 260, overflow: "auto", fontSize: 13 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ minWidth: 110, fontWeight: 700, color: "#0f172a" }}>{label}</div>
              <div style={{ flex: 1, color: "#334155", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{value ?? "-"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // hide the cart entirely if user is not logged in
  if (!loggedIn) return null;

  return (
    <>
      <button
        className="cartButton"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Open cart"
      >
        🛒 Cart ({orders.length})
      </button>

      {open && (
        <div className="cartPopup" ref={popupRef} role="dialog" aria-label="Cart contents">
          <div className="cartPopupHeader">
            <strong>Current Orders</strong>
            <div className="cartHeaderActions">
              <button className="cartRemoveAllBtn" onClick={removeAll}>Remove all</button>
            </div>
          </div>

          <div className="cartList">
            {orders.length === 0 ? (
              <div className="cartEmpty">No items in cart</div>
            ) : (
              orders.map((order, idx) => {
                const title =
                  order?.truck?.model ||
                  order?.truck?.description ||
                  order?.truck?.orderableId ||
                  order?.description ||
                  order?.title ||
                  "Unnamed item";
                const price =
                  order?.totalPrice ??
                  order?.total_price ??
                  order?.unitPrice ??
                  order?.truck?.basePrice ??
                  null;
                return (
                  <div className="cartItemWrapper" key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="cartItem" style={{ alignItems: "center" }}>
                      <div className="cartItemInfo" style={{ flex: 1, minWidth: 0 }}>
                        <div className="cartItemTitle">{title}</div>
                        {price !== null && (
                          <div className="cartItemPrice">₱{Number(price).toLocaleString()}</div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="cartExpandBtn"
                          onClick={() => toggleExpand(idx)}
                          aria-expanded={isExpanded(idx)}
                          aria-label={isExpanded(idx) ? "Collapse details" : "Expand details"}
                        >
                          {isExpanded(idx) ? "▾" : "▸"}
                        </button>

                        <button className="cartRemoveBtn" onClick={() => removeAt(idx)}>
                          Remove
                        </button>
                      </div>
                    </div>

                    {isExpanded(idx) && renderDetails(order)}
                  </div>
                );
              })
            )}
          </div>

          <div className="cartPopupFooter">
            <button className="cartCheckoutBtn" onClick={handleCheckout}>Checkout</button>
            <button className="cartCloseBtn" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}