import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext(null);

// Provider component — wraps the entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem("shms_token");
    const savedUser = localStorage.getItem("shms_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // Called after successful login
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("shms_token", jwtToken);
    localStorage.setItem("shms_user", JSON.stringify(userData));
  };

  // Called on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("shms_token");
    localStorage.removeItem("shms_user");
  };

  // Helper — check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Helper — check if user has any of multiple roles
  const hasAnyRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in every component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export default AuthContext;
