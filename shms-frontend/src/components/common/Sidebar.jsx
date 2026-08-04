import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="d-flex flex-column p-3"
      style={{
        width: "220px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #dee2e6",
      }}
    >
      {items.map((item) => (
        <button
          key={item.path}
          className={`btn text-start mb-1 ${
            location.pathname === item.path ? "btn-primary" : "btn-light"
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
