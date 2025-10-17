// src/App.jsx
import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import Nav from "./static/components/Nav";
import AuthNav from "./static/components/UserAuth/AuthNav";
import "./static/components/UserAuth/AuthNav.css";
import HomeNav from "./static/components/HomePage/HomeNav";
import InventoryNav from "./static/components/NewInventory/InventoryNav";
import BrandAvailableNav from "./static/components/BrandAvailable/BrandAvailableNav";
import FaqContentNav from "./static/components/FAQ/FaqContentNav";
import ScrollToTop from "./static/components/ScrollToTop";
import TermandCondition from "./static/components/TermandCondition";
import Branches from "./static/components/Branches/Branches";
import ProductPage from "./static/components/NewInventory/ProductPage";
import AccountNav from "./static/components/CustomerInfo/AccountNav.jsx";
import OrderNav from "./static/components/CustomerInfo/OrderNav";
import OwnerDashboard from "./static/components/SalesDashboard/OwnerDashboard";
import SalesDashboard from "./static/components/SalesDashboard/SalesDashboard";
import OTPVerificationPage from "./static/components/OTPVerification/OtpVerificationPage.jsx";
import PaymentNav from "./static/components/Payment/PaymentNav";
import InstallmentPay from "./static/components/Payment/InstallmentPay.jsx";
import BankPay from "./static/components/Payment/BankPay.jsx";
import PaySuccess from "./static/components/Payment/PaySuccess";
import PayFailed from "./static/components/Payment/PayFailed";
import { UserProvider, useUser } from "./static/Context/UserContext";
import PaymentPending from "./static/components/Payment/PaymentPending.jsx";

function AppContent() {
  const location = useLocation();
  const { user, setUser } = useUser();
  const isSalesDashboard = location.pathname === "/SalesDashboard";

  // Overlay/modal state
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const [overlayView, setOverlayView] = React.useState("role");

  // Listen for custom openOverlay event
  React.useEffect(() => {
    const handleOpenOverlay = (e) => {
      setOverlayOpen(true);
      setOverlayView(e.detail?.view || "role");
      // Store overlay state globally for redirect after login
      window.__overlayState = e.detail || {};
    };
    window.addEventListener("openOverlay", handleOpenOverlay);
    return () => {
      window.removeEventListener("openOverlay", handleOpenOverlay);
      window.__overlayState = undefined;
    };
  }, []);

  // Handler to close overlay
  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    setOverlayView("role");
  };

  // Handlers to open overlay for Nav
  const handleOpenOverlay = () => {
    setOverlayOpen(true);
    setOverlayView("customer");
  };
  const handleOpenRegister = () => {
    setOverlayOpen(true);
    setOverlayView("register");
  };

  return (
    <div className="App">
      {/* Always show Nav for logged-out users, except on SalesDashboard */}
      {!isSalesDashboard && (
        <Nav
          onOpenOverlay={handleOpenOverlay}
          onOpenRegister={handleOpenRegister}
        />
      )}
      <ScrollToTop />

      <div className="content">
        <Routes>
          <Route path="/" element={<HomeNav />} />
          <Route path="/homeNav" element={<HomeNav />} />
          <Route path="/inventoryNav" element={<InventoryNav />} />
          <Route path="/BrandAvailableNav" element={<BrandAvailableNav />} />
          <Route path="/Branches" element={<Branches />} />
          <Route path="/FaqContentNav" element={<FaqContentNav />} />
          <Route path="/TermandCondition" element={<TermandCondition />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/AccountNav" element={<AccountNav />} />
          <Route path="/OrderNav" element={<OrderNav />} />
          <Route path="/SalesDashboard" element={<SalesDashboard />} />
          <Route path="/OwnerDashboard" element={<OwnerDashboard />} />  
          <Route path="/OTPVerificationPage" element={<OTPVerificationPage />} />
          <Route path="/PaymentNav" element={<PaymentNav />} />
          <Route path="/PaySuccess" element={<PaySuccess />} />
          <Route path="/PayFailed" element={<PayFailed />} />
          <Route path="/PaymentPending" element={<PaymentPending />} />
          <Route path="/InstallmentPay" element={<InstallmentPay />} />
          <Route path="/BankPay" element={<BankPay />} />
        </Routes>
      </div>

      {/* AuthNav modal for sign in/sign up */}
      {overlayOpen && (
        <AuthNav
          view={overlayView}
          setView={setOverlayView}
          onClose={handleCloseOverlay}
        />
      )}

      {!isSalesDashboard && <footer>© 2025 Ancar Motors</footer>}
    </div>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App;
