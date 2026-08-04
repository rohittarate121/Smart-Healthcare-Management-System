import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import ReceptionHome from "../../components/receptionist/ReceptionHome";
import WalkInBooking from "../../components/receptionist/WalkInBooking";
import CheckInPatient from "../../components/receptionist/CheckInPatient";
import BillingManagement from "../../components/receptionist/BillingManagement";

const sidebarItems = [
  {
    path: "/receptionist",
    icon: "🏠",
    label: "Dashboard",
  },
  {
    path: "/receptionist/book",
    icon: "📅",
    label: "Book Appointment",
  },
  {
    path: "/receptionist/checkin",
    icon: "✅",
    label: "Patient Check-in",
  },
  {
    path: "/receptionist/billing",
    icon: "💳",
    label: "Billing & Inpatients",
  },
];

const ReceptionistDashboard = () => {
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
            <Route index element={<ReceptionHome />} />
            <Route path="book" element={<WalkInBooking />} />
            <Route path="checkin" element={<CheckInPatient />} />
            <Route path="billing" element={<BillingManagement />} />
            <Route path="*" element={<Navigate to="/receptionist" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
