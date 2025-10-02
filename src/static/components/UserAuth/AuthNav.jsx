import React from "react";
import RoleSelector from "./RoleSelector";
import CustomerAuth from "./CustomerAuth";
import AdminAuth from "./AdminAuth";
import RegisterForm from "../CustomerInfo/RegisterForm.jsx";
import "./AuthNav.css";

const AuthNav = ({ view, setView, onClose }) => {
  return (
    <div className="authnav-overlay">
  {view === "role" && (
    <div className="authnav-form">
      <button className="close-button-authnav" onClick={onClose}>X</button>
      <RoleSelector setView={setView} />
    </div>
  )}

  {view === "customer" && (
    <div className="authnav-form">
      <button className="close-button-authnav" onClick={onClose}>X</button>
      <CustomerAuth setView={setView} onClose={onClose} />
    </div>
  )}

  {view === "admin" && (
    <div className="authnav-form">
      <button className="close-button-authnav" onClick={onClose}>X</button>
      <AdminAuth setView={setView} onClose={onClose} />
    </div>
  )}

  {view === "register" && (
    <div className="authnav-form">
      <button className="close-button-authnav" onClick={onClose}>X</button>
      <RegisterForm
        onRegisterSuccess={() => setView("customer")}
        onBackToLogin={() => setView("customer")}
      />
    </div>
  )}
</div>
  );
};

export default AuthNav;
