import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Lab Tech pages
import LabTechDashboard from "./pages/labtech/LabTechDashboard";

// Receptionist pages
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";

// LandingPage
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default redirect */}
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/" element={<LandingPage />} />
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          // Add this inside public routes:
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* Patient routes */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          {/* Doctor routes */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Lab Tech routes */}
          <Route
            path="/labtech/*"
            element={
              <ProtectedRoute allowedRoles={["LAB_TECH"]}>
                <LabTechDashboard />
              </ProtectedRoute>
            }
          />
          {/* Receptionist routes */}
          <Route
            path="/receptionist/*"
            element={
              <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
