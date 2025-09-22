// src/static/Context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load user from localStorage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [overlayVisible, setOverlayVisible] = useState(!user); // hide overlay if user is logged in

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setOverlayVisible(false);
    } else {
      localStorage.removeItem("user");
      setOverlayVisible(true);
    }
  }, [user]);

  const login = (userData, role) => {
    setUser({ ...userData, role });
    setOverlayVisible
  };

  const logout = () => {
    setUser(null);
    setOverlayVisible
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        overlayVisible,
        setOverlayVisible,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
