import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CustomerAuth.css";
import { useUser } from "../../Context/UserContext.jsx";

const CustomerAuth = ({ setView, onClose }) => {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (username.includes("@")) {
        params.append("email_address", username);
      } else if (!isNaN(username)) {
        params.append("userid", username);
      } else {
        params.append("username", username);
      }
      params.append("password", password);
      const response = await fetch(
        `/.netlify/functions/get_customer?${params.toString()}`,
        { method: "GET" }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Invalid credentials");
      }
      const customerData = await response.json();
      const fullUser = { ...customerData.user, role: "customer" };
      login(fullUser, "customer");
      localStorage.setItem("user", JSON.stringify(fullUser));
      alert("✅ Customer login successful!");
      // Redirect logic: if login was triggered by checkout, go to product page; else homepage
      if (location.state && location.state.fromCheckout && location.state.productPath) {
        navigate(location.state.productPath, { state: location.state.productState });
      } else {
        localStorage.removeItem("lastProductPage"); // clear last visited truck
        navigate("/homeNav");
      }
      onClose();
    } catch (err) {
      alert("❌ Login failed: " + err.message);
    }
  };

  return (
    <div className="customer-login">
      <h2>Customer Login</h2>
      <form onSubmit={handleCustomerSubmit}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="Loginbutton" type="submit">Login</button>
        <button className="Backbutton" type="button" onClick={() => setView("role")}>Back</button>
        <p>
          Don’t have an account?{' '}
          <span onClick={() => setView("register")}>Register here</span>
        </p>
      </form>
    </div>
  );
};

export default CustomerAuth;
