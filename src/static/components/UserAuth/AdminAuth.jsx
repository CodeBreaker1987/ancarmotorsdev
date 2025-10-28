import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAuth.css";
import { useUser } from "../../Context/UserContext.jsx";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminAuth = ({ setView, onClose }) => {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      toast.success("Admin login successful!",);
      onClose();
      // Determine if user is owner
      const position = (fullUser.company_position || fullUser.position || "").toLowerCase();
      if (position.includes("owner")) {
        navigate("/OwnerDashboard");
      } else {
        navigate("/SalesDashboard");
      }
    } catch (err) {
      toast.error("Login failed: " + err.message,);
    }
  };

  return (
    <div className="admin-login">
      <h2>Company Member Login</h2>
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
