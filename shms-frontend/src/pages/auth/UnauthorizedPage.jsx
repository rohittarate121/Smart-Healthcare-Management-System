import React from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container mt-5 text-center">
      <h2 className="text-danger">Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      <button className="btn btn-primary" onClick={() => navigate("/login")}>
        Back to Login
      </button>
    </div>
  );
};

export default UnauthorizedPage;
