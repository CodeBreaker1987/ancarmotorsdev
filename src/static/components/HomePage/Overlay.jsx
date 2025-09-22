// Overlay.jsx
import React, { useState } from "react";
import "./Overlay.css";
import { GiShoppingBag } from "react-icons/gi";
import { FcSalesPerformance } from "react-icons/fc";
import { useUser } from "../../Context/UserContext.jsx";

const Overlay = ({ onCloseCustomer, onAdminLoginSuccess }) => {
  const { login } = useUser();
  const [view, setView] = useState("role"); // "role", "admin", "customer", "register"

  // Login/Register fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showCriteria, setShowCriteria] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- ADMIN LOGIN ---
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/.netlify/functions/get_admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("Invalid admin credentials");
      const adminData = await response.json();

      const fullUser = { ...adminData.data, role: "admin" };
      login(fullUser, "admin");
      localStorage.setItem("user", JSON.stringify(fullUser));

      alert("✅ Admin login successful!");
      onAdminLoginSuccess?.();
    } catch (err) {
      alert("❌ Login failed: " + err.message);
    }
  };

  // --- CUSTOMER LOGIN --- //
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
      onCloseCustomer();
    } catch (err) {
      alert("❌ Login failed: " + err.message);
    }

    console.log("Login attempted with:", username, "password:", password);
  };

  // --- REGISTRATION --- //
  const criteria = {
    length: regPassword.length >= 8 && regPassword.length <= 16,
    uppercase: /[A-Z]/.test(regPassword),
    number: /\d/.test(regPassword),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
  };

  const validateRegistration = () => {
    const emailRegex = /^[\w.%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i;
    const phoneRegex = /^(\+639\d{9}|09\d{9})$/;
    const usernameRegex = /^[a-zA-Z0-9_]{8,16}$/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!emailRegex.test(email)) {
      alert("Invalid email format (must be Gmail, Yahoo, or Outlook).");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      alert("Invalid phone format. Use +639xxxxxxxxx or 09xxxxxxxxx.");
      return false;
    }
    if (!usernameRegex.test(regUsername)) {
      alert(
        "Username must be 8-16 characters, only letters, numbers, or underscores."
      );
      return false;
    }
    if (!passwordRegex.test(regPassword)) {
      alert(
        "Password must be 8-16 characters, include 1 uppercase, 1 number, 1 symbol."
      );
      return false;
    }
    if (regPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegistration()) return;

    try {
      const response = await fetch("/.netlify/functions/reg_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          address,
          email,
          phone,
          username: regUsername,
          password: regPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to register");
      const data = await response.json();

      const fullUser = { ...data.user, role: "customer" };
      login(fullUser, "customer");
      localStorage.setItem("user", JSON.stringify(fullUser));

      alert("✅ Registration successful!");
      setView("customer");
    } catch (err) {
      alert("❌ Registration failed: " + err.message);
    }
  };

  return (
    <div className="overlay">
      {/* Role Selector */}
      {view === "role" && (
        <div className="role-selector">
          <h2>I AM A :</h2>
          <div className="Role-images">
            <GiShoppingBag className="icon-circle customer" />
            <FcSalesPerformance className="icon-circle sales" />
          </div>
          <div className="overlaybuttons">
            <button onClick={() => setView("customer")}>Customer</button>
            <button onClick={() => setView("admin")}>Administrator</button>
          </div>
        </div>
      )}

      {/* Admin Login */}
      {view === "admin" && (
        <div className="admin-login">
          <h2>Administrator Login</h2>
          <form onSubmit={handleAdminSubmit}>
            <input
              type="text"
              placeholder="Username"
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
            <button type="submit">Login</button>
            <button type="button" onClick={() => setView("role")}>
              Back
            </button>
            <div className="ITdetails">
              <span>Need an Account? Contact IT Department.</span>
            </div>
          </form>
        </div>
      )}

      {/* Customer Login */}
      {view === "customer" && (
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
            <button className="Loginbutton" type="submit">
              Login
            </button>
            <button
              className="Backbutton"
              type="button"
              onClick={() => setView("role")}
            >
              Back
            </button>
            <button
              className="login-later-btn"
              type="button"
              onClick={onCloseCustomer}
            >
              Login Later
            </button>
            <p>
              Don’t have an account?{" "}
              <span
                style={{
                  color: "#3799d4",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setView("register")}
              >
                Register here
              </span>
            </p>
          </form>
        </div>
      )}

      {/* Customer Registration */}
      {view === "register" && (
        <div className="register-form">
          <h2>Customer Registration</h2>
          <form onSubmit={handleRegisterSubmit}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Home Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Username (8-16 chars)"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={regPassword}
              onFocus={() => setShowCriteria(true)}
              onBlur={() => setShowCriteria(false)}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button className="Registerbutton" type="submit">
              Register
            </button>
            <button
              className="Backbutton"
              type="button"
              onClick={() => setView("customer")}
            >
              Back to Login
            </button>
          </form>

          {showCriteria && (
            <div className="password-popup">
              <p className={criteria.length ? "valid" : "invalid"}>
                ✔ 8–16 characters
              </p>
              <p className={criteria.uppercase ? "valid" : "invalid"}>
                ✔ At least 1 uppercase letter
              </p>
              <p className={criteria.number ? "valid" : "invalid"}>
                ✔ At least 1 number
              </p>
              <p className={criteria.symbol ? "valid" : "invalid"}>
                ✔ At least 1 symbol
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Overlay;
