import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import AdminHome from "../../components/admin/AdminHome";
import ManageUsers from "../../components/admin/ManageUsers";
import ManageClaims from "../../components/admin/ManageClaims";
import ManageAdmissions from "../../components/admin/ManageAdmissions";
import CreateStaff from "../../components/admin/CreateStaff";
import BillingManagement from "../../components/receptionist/BillingManagement";

const sidebarItems = [
  {
    path: "/admin",
    icon: "📊",
    label: "Dashboard",
  },
  {
    path: "/admin/users",
    icon: "👥",
    label: "Manage Users",
  },
  {
    path: "/admin/create-staff",
    icon: "➕",
    label: "Create Staff",
  },
  {
    path: "/admin/claims",
    icon: "🛡️",
    label: "Insurance Claims",
  },
  {
    path: "/admin/admissions",
    icon: "🏥",
    label: "Admissions",
  },
  {
    path: "/admin/billing",
    icon: "💳",
    label: "Billing & Invoices",
  },
];

const AdminDashboard = () => {
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
            <Route index element={<AdminHome />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="create-staff" element={<CreateStaff />} />
            <Route path="claims" element={<ManageClaims />} />
            <Route path="admissions" element={<ManageAdmissions />} />
            <Route path="billing" element={<BillingManagement />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
