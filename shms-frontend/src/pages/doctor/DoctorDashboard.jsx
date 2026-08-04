import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import DoctorHome from "../../components/doctor/DoctorHome";
import DoctorSchedule from "../../components/doctor/DoctorSchedule";
import PatientConsultation from "../../components/doctor/PatientConsultation";
import ManageSlots from "../../components/doctor/ManageSlots";
import DoctorProfilePage from "./DoctorProfilePage";

const sidebarItems = [
  {
    path: "/doctor",
    icon: "🏠",
    label: "Dashboard",
  },
  {
    path: "/doctor/profile",
    icon: "👤",
    label: "Profile",
  },
  {
    path: "/doctor/schedule",
    icon: "📅",
    label: "My Schedule",
  },
  {
    path: "/doctor/slots",
    icon: "🕐",
    label: "Manage Slots",
  },
];

const DoctorDashboard = () => {
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
            <Route index element={<DoctorHome />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route
              path="consultation/:apptId"
              element={<PatientConsultation />}
            />
            <Route path="slots" element={<ManageSlots />} />
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
