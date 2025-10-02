// src/static/components/HomePage/HomeNav.jsx
import React, { useEffect } from "react";
import "./HomeNav.css";
import Header from "./Header";
import Brand from "./Brand";
import Faq from "./Faq";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav";
import { useUser } from "../../Context/UserContext";

const HomeNav = () => {
  const { user } = useUser(); 
  const navigate = useNavigate();

  // Redirect if user just logged in
  useEffect(() => {
    if (user) {
      const lastProduct = localStorage.getItem("lastProductPage");
      if (lastProduct) {
        const { pathname, state } = JSON.parse(lastProduct);
        navigate(pathname, { state });
        localStorage.removeItem("lastProductPage");
      }
    }
  }, [user, navigate]);

  // Function to request overlay open from Nav (handled by App.jsx)
  const openOverlay = (view = "role") => {
    window.dispatchEvent(new CustomEvent("openOverlay", { detail: { view } }));
  };

  return (
    <div className="homeNavcontainer">
      {/* Nav can trigger overlay opening */}
      <Nav
        onOpenOverlay={() => openOverlay("role")}
        onOpenRegister={() => openOverlay("register")}
      />

      {/* Main content */}
      <Header />
      <Brand />
      <Faq />
      <Footer />
    </div>
  );
};

export default HomeNav;
