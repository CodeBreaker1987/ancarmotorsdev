// Nav.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Nav.css";
import AncarLogo from "/src/assets/media/AncarLogo.7ad7473b37e000adbeb6.png";
import { useUser } from "../Context/UserContext.jsx";

const Nav = ({ onOpenOverlay, onOpenRegister }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleMenuToggleOpen = () => setMenuOpen(!menuOpen);
  const handleMenuToggleClose = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };
  const handleDropdownToggle = () => setDropdownOpen(!dropdownOpen);

  const handleSignOut = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    logout(); // triggers confirmation modal
  };

  // ❌ Hide Nav completely for admin
  if (user?.role === "admin") return null;

  return (
    <div id="home" className="boxNav">
      <nav className="App-nav">
        <img className="App-logo navLogoMobile" src={AncarLogo} alt="Ancar Motors Inc Logo" />
        <span className="navCompanyName navLogoMobile">Ancar Motors Inc.</span>

        <div className={`menu-toggle ${menuOpen ? "change" : ""}`} onClick={handleMenuToggleOpen}>
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>

        <div className={`nav-links ${menuOpen ? "show" : ""}`}>
          <img className="App-logo navLogoWeb" src={AncarLogo} alt="Ancar Motors Inc Logo" />
          <span className="navCompanyName navLogoWeb">Ancar Motors Inc.</span>

          <Link className="Order-list" to="/HomeNav" onClick={handleMenuToggleClose}>
            <div className="textnav-size">HOME<hr /></div>
          </Link>
          <Link className="Order-list" to="/InventoryNav" onClick={handleMenuToggleClose}>
            <div className="textnav-size">UNITS STOCK<hr /></div>
          </Link>
          <Link className="Order-list" to="/BrandAvailableNav" onClick={handleMenuToggleClose}>
            <div className="textnav-size">PARTNERSHIPS<hr /></div>
          </Link>
          <Link className="Order-list" to="/Branches" onClick={handleMenuToggleClose}>
            <div className="textnav-size">BRANCHES<hr /></div>
          </Link>
          <Link className="Order-list" to="/FaqContentNav" onClick={handleMenuToggleClose}>
            <div className="textnav-size">FAQ's<hr /></div>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="Order-list dropdown-wrapper">
              <Link className="dropdown-toggle" onClick={handleDropdownToggle}>
                {user.role === "admin"
                  ? `${user.firstname} ${user.lastname}`
                  : user.firstname || "My Account"} <hr />
              </Link>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  {user.role === "admin" ? (
                    <Link to="/SalesDashboard" className="dropdown-item" onClick={handleMenuToggleClose}>
                      Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/AccountNav" className="dropdown-item" onClick={handleMenuToggleClose}>
                        My Profile
                      </Link>
                      <Link to="/OrderNav" className="dropdown-item" onClick={handleMenuToggleClose}>
                        My Orders
                      </Link>
                    </>
                  )}
                  <button className="SignOutButton" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
             <Link
              className="Order-list"
              onClick={() => onOpenOverlay?.()}
            >
              <div className="textnav-size">SIGN IN<hr /></div>
            </Link>
            <Link
              className="Order-list"
              onClick={() => onOpenRegister?.()}
            >
              <div className="textnav-size">SIGN UP<hr /></div>
            </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Nav;
