import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PatientAPI from "../../api/patientAPI";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await PatientAPI.getUnreadNotifications();
      setUnreadCount(res.data.length);
    } catch (err) {
      // Silently fail — bell icon stays at 0
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg
        navbar-dark px-4"
      style={{ backgroundColor: "#0d6efd" }}
    >
      <span className="navbar-brand fw-bold">🏥 SHMS</span>

      <div
        className="ms-auto d-flex
        align-items-center gap-3"
      >
        {/* Bell icon */}
        <span
          className="text-white position-relative"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/patient/notifications")}
        >
          🔔
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0
                start-100 translate-middle badge
                rounded-pill bg-danger"
              style={{ fontSize: "10px" }}
            >
              {unreadCount}
            </span>
          )}
        </span>

        {/* User info */}
        <span className="text-white small">{user?.name}</span>

        {/* Logout */}
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
