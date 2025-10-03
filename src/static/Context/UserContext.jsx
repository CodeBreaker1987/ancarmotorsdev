// src/static/Context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // ...existing code...
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Load user from localStorage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || savedUser === "undefined") return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [overlayVisible, setOverlayVisible] = useState(!user); // hide overlay if user is logged in
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check session expiration on initial load
  useEffect(() => {
    const loginTimestamp = localStorage.getItem("loginTimestamp");
    if (user && loginTimestamp) {
      const now = Date.now();
      if (now - parseInt(loginTimestamp, 10) > 2 * 60 * 60 * 1000) {
        setSessionExpired(true);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("loginTimestamp");
      }
    }
  }, []); // run once on mount

  // Persist user and login timestamp to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // If no loginTimestamp, set it now
      if (!localStorage.getItem("loginTimestamp")) {
        localStorage.setItem("loginTimestamp", Date.now().toString());
      }
      setOverlayVisible(false);
    } else {
      setOverlayVisible(true);
      localStorage.removeItem("loginTimestamp");
    }
  }, [user]);

  // Session timeout logic (2 hours inactivity)
  useEffect(() => {
    if (!user) return;
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Update loginTimestamp on activity
      localStorage.setItem("loginTimestamp", Date.now().toString());
      timeoutId = setTimeout(() => {
        setSessionExpired(true);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("loginTimestamp");
      }, 2 * 60 * 60 * 1000); // 2 hours
    };
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const login = (userData, role) => {
    setUser({ ...userData, role });
    localStorage.setItem("loginTimestamp", Date.now().toString());
    setOverlayVisible(false);
  };

  // Show sign out confirmation modal
  const requestSignOut = () => {
    setShowSignOutModal(true);
  };

  // Confirm sign out
  const confirmSignOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
    setOverlayVisible(true);
    setShowSignOutModal(false);
    window.location.href = "/";
  };

  // Cancel sign out
  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout: requestSignOut,
        overlayVisible,
        setOverlayVisible,
        sessionExpired,
        setSessionExpired,
        showSignOutModal,
        confirmSignOut,
        cancelSignOut,
      }}
    >
      {children}
      {/* Session Timeout Modal */}
      {sessionExpired && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 350, boxShadow: "0 8px 32px rgba(79,70,229,0.18)" }}>
            <h2 style={{ marginBottom: 24 }}>Session Timeout</h2>
            <p>Your session has expired due to inactivity. Please log in again.</p>
            <button style={{ marginTop: 32, padding: "10px 24px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
              onClick={() => {
                setSessionExpired(false);
                Navigate("/"); // Redirect to homepage or login page
              }}
            >OK</button>
          </div>
        </div>
      )}
      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 350, boxShadow: "0 8px 32px rgba(79,70,229,0.18)" }}>
            <h2 style={{ marginBottom: 24, marginLeft: 130 }}>Sign Out</h2>
            <p style={{marginLeft: 80}}>Do you want to sign out?</p>
            <div style={{ display: "flex", gap: 36, marginTop: 32, marginLeft: 60 }}>
              <button style={{ padding: "10px 24px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
                onClick={confirmSignOut}
              >Sign Out</button>
              <button style={{ padding: "10px 24px", borderRadius: 8, background: "#6b7280", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
                onClick={cancelSignOut}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
