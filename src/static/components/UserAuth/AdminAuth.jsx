import React, { useState } from "react";
import "./AdminAuth.css";
import { useUser } from "../../Context/UserContext.jsx";

const AdminAuth = ({ setView, onClose }) => {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      onClose();
    } catch (err) {
      alert("❌ Login failed: " + err.message);
    }
  };

  return (
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
        <button type="button" onClick={() => setView("role")}>Back</button>
        <div className="ITdetails">
          <span>Need an Account? Contact IT Department.</span>
        </div>
      </form>
    </div>
  );
};

export default AdminAuth;
