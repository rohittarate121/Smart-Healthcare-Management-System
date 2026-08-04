import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import LabTechHome from "../../components/labtech/LabTechHome";
import UploadReport from "../../components/labtech/UploadReport";

const sidebarItems = [
  {
    path: "/labtech",
    icon: "🏠",
    label: "Dashboard",
  },
  {
    path: "/labtech/upload",
    icon: "📤",
    label: "Upload Reports",
  },
];

const LabTechDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="d-flex">
        <Sidebar items={sidebarItems} />
        <div
          className="flex-grow-1 p-4"
          style={{
            backgroundColor: "#f0f9ff",
            minHeight: "100vh",
          }}
        >
          <Routes>
            <Route index element={<LabTechHome />} />
            <Route path="upload" element={<UploadReport />} />
            <Route path="*" element={<Navigate to="/labtech" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LabTechDashboard;
