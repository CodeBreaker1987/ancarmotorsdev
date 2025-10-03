// src/static/components/NewInventory/ProductPage.jsx
import React, { useEffect, useState } from "react";
import TruckOrderForm from "./TruckOrderForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";
import "./ProductPage.css";

const ProductPage = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Use state for truck so it can be restored
  const [truck, setTruck] = useState(location.state?.truck || null);

  // Save truck info to localStorage whenever visiting this page
  useEffect(() => {
    if (truck) {
      localStorage.setItem(
        "lastProductPage",
        JSON.stringify({
          pathname: location.pathname,
          state: { truck },
        })
      );
    }
  }, [truck, location.pathname]);

  // Restore from localStorage ONLY if routed from checkout
  useEffect(() => {
    if (!truck && location.state && location.state.fromCheckout) {
      const saved = localStorage.getItem("lastProductPage");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.state?.truck) {
          setTruck(parsed.state.truck);
        }
      }
    }
  }, [truck, location.state]);

  // Overlay open handlers
  const handleOpenOverlay = () => {
    const event = new CustomEvent("openOverlay", { detail: { view: "customer" } });
    window.dispatchEvent(event);
  };

  const handleOpenRegister = () => {
    const event = new CustomEvent("openOverlay", { detail: { view: "register" } });
    window.dispatchEvent(event);
  };

  if (!truck) {
    return <h2 className="text-center text-red-600">Product not found 🚚</h2>;
  }

  return (
    <div className="productPageContainer">
      {/* === Back Button === */}
      <div className="returnButtonContainer">
        <button
          className="returnButton"
          onClick={() => navigate("/InventoryNav")}
        >
          ◁ Return
        </button>
      </div>

      {/* === Product Gallery === */}
      <div className="productGallery">
        <img
          src={truck.thumbnail}
          alt={truck.description}
          className="productImage"
        />
      </div>

      {/* === Product Info === */}
      <div className="productInfo">
        <div className="productStyle">
          <h1 className="productTitle">{truck.description}</h1>
          <p className="productDetails">{truck.Details}</p>
        </div>

        {/* === Truck Order Form === */}
        <TruckOrderForm
          truck={truck}
          basePrice={truck.basePrice}
          user={user}
          onOpenOverlay={handleOpenOverlay}
          onOpenRegister={handleOpenRegister}
        />
      </div>
    </div>
  );
};

export default ProductPage;
