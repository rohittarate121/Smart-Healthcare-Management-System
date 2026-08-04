import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import PatientHome from "../../components/patient/PatientHome";
import PatientProfile from "../../components/patient/PatientProfile";
import SymptomChecker from "../../components/patient/SymptomChecker";
import MyAppointments from "../../components/patient/MyAppointments";
import BookAppointment from "../../components/patient/BookAppointment";
import MyPrescriptions from "../../components/patient/MyPrescriptions";
import MyLabReports from "../../components/patient/MyLabReports";
import MyInsurance from "../../components/patient/MyInsurance";

const sidebarItems = [
  { path: "/patient", icon: "🏠", label: "Home" },
  { path: "/patient/profile", icon: "👤", label: "My Profile" },
  { path: "/patient/symptoms", icon: "🤖", label: "AI Symptom Check" },
  { path: "/patient/appointments", icon: "📅", label: "My Appointments" },
  { path: "/patient/book", icon: "➕", label: "Book Appointment" },
  { path: "/patient/prescriptions", icon: "💊", label: "Prescriptions" },
  { path: "/patient/lab-reports", icon: "🔬", label: "Lab Reports" },
  { path: "/patient/insurance", icon: "🛡️", label: "Insurance" },
];

const PatientDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="d-flex">
        <Sidebar items={sidebarItems} />
        <div
          className="flex-grow-1 p-4"
          style={{ backgroundColor: "#f0f9ff", minHeight: "100vh" }}
        >
          <Routes>
            <Route index element={<PatientHome />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="symptoms" element={<SymptomChecker />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="prescriptions" element={<MyPrescriptions />} />
            <Route path="lab-reports" element={<MyLabReports />} />
            <Route path="insurance" element={<MyInsurance />} />
            <Route path="*" element={<Navigate to="/patient" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
