// src/App.jsx
import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import Nav from "./static/components/Nav";
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
import SalesDashboard from "./static/components/SalesDashboard/SalesDashboard";
import { UserProvider, useUser } from "./static/Context/UserContext";

function AppContent() {
  const location = useLocation();
  const { setUser } = useUser();
  const isSalesDashboard = location.pathname === "/SalesDashboard";

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("user");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <div className="App">
      {!isSalesDashboard && <Nav />}
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
        </Routes>
      </div>

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
