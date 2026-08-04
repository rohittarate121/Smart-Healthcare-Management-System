import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthAPI from "../../api/authAPI";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Step 1 — Submit email and password
  const handleLoginStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await AuthAPI.login(formData);

      if (response.data.success) {
        if (response.data.token) {
          // Direct login for Staff roles (SUPER_ADMIN, ADMIN, DOCTOR, RECEPTIONIST, LAB_TECH)
          login(
            {
              userId: response.data.userId,
              name: response.data.name,
              role: response.data.role,
              email: formData.email,
            },
            response.data.token,
          );
          redirectByRole(response.data.role);
        } else {
          // OTP flow for Patients
          setMessage(response.data.message);
          setStep(2);
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Submit OTP
  const handleLoginStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await AuthAPI.verifyLoginOtp({
        email: formData.email,
        otp: otp,
      });

      if (response.data.success) {
        login(
          {
            userId: response.data.userId,
            name: response.data.name,
            role: response.data.role,
            email: formData.email,
          },
          response.data.token,
        );
        redirectByRole(response.data.role);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid OTP. Please check and try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("OTP verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    const routes = {
      PATIENT: "/patient",
      DOCTOR: "/doctor",
      ADMIN: "/admin",
      SUPER_ADMIN: "/admin",
      LAB_TECH: "/labtech",
      RECEPTIONIST: "/receptionist",
    };
    navigate(routes[role] || "/login");
  };

  return (
    <div
      className="container-fluid min-vh-100
        d-flex align-items-center
        justify-content-center"
      style={{ backgroundColor: "#f0f9ff" }}
    >
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">SHMS</h3>
          <p className="text-muted small mb-0">
            Smart Healthcare Management System
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="alert alert-danger
            py-2 d-flex align-items-start gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Email + Password ── */}
        {step === 1 && (
          <form onSubmit={handleLoginStep1} noValidate>
            <h5 className="mb-3 fw-bold">Login</h5>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Password with eye icon */}
            <div className="mb-1">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-end mb-3">
              {/* <span
                className="small text-primary"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  alert(
                    "Password reset via OTP will be " +
                      "available after .NET notification " +
                      "service is connected. " +
                      "Contact admin for now.",
                  )
                }
              >
                Forgot password?
              </span> */}
              <Link
                to="/forgot-password"
                className="small text-primary"
                style={{ textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border
                      spinner-border-sm me-2"
                  />
                  Verifying...
                </>
              ) : (
                "Continue →"
              )}
            </button>

            <div className="text-center mt-3">
              <span className="text-muted small">New patient? </span>
              <Link to="/register" className="small">
                Register here
              </Link>
            </div>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <form onSubmit={handleLoginStep2} noValidate>
            <div className="text-center mb-3">
              <div style={{ fontSize: "2.5rem" }}>📱</div>
              <h5 className="fw-bold mb-1">Enter OTP</h5>
              <p className="text-muted small">
                {message || "OTP sent to your registered phone."}
              </p>
              <p className="text-muted small">
                Email: <strong>{formData.email}</strong>
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label">One-Time Password</label>
              <input
                type="text"
                className="form-control form-control-lg
                  text-center fw-bold
                  letter-spacing-wide"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => {
                  // Only allow numbers
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                  setError("");
                }}
                maxLength={6}
                required
                autoFocus
              />
              <small className="text-muted">
                Check Eclipse console for OTP (email service coming soon)
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 mb-2"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border
                      spinner-border-sm me-2"
                  />
                  Verifying...
                </>
              ) : (
                "✓ Verify & Login"
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary
                w-100"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
