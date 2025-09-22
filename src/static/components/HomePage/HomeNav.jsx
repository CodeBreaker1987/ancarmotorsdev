import React, { useState, useEffect } from "react";
import "./HomeNav.css";
import Header from "./Header";
import Brand from "./Brand";
import Faq from "./Faq";
import Footer from "../Footer";
import Overlay from "./Overlay";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav";
import { useUser } from "../../Context/UserContext";

const HomeNav = () => {
  const { user } = useUser(); // get logged-in user
  const [overlayVisible, setOverlayVisible] = useState(true);
  const navigate = useNavigate();

  // Automatically hide overlay if user is logged in
  useEffect(() => {
    if (user) setOverlayVisible(false);
  }, [user]);

  // Callback when customer closes overlay
  const handleCustomerClose = () => {
    setOverlayVisible(false);
  };

  // Callback when admin login succeeds
  const handleAdminLoginSuccess = () => {
    navigate("/SalesDashboard");
  };

  return (
    <div className="homeNavcontainer">
      {/* Overlay */}
      {overlayVisible && (
        <Overlay
          onCloseCustomer={handleCustomerClose}
          onAdminLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* Nav with ability to reopen overlay */}
      <Nav onOpenOverlay={() => setOverlayVisible(true)} />

      {/* Main content */}
      <Header />
      <Brand />
      <Faq />
      <Footer />
    </div>
  );
};

export default HomeNav;
