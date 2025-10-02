import React from "react";
import "./RoleSelector.css";
import { GiShoppingBag } from "react-icons/gi";
import { FcSalesPerformance } from "react-icons/fc";

const RoleSelector = ({ setView }) => (
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
);

export default RoleSelector;
