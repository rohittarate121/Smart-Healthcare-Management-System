import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthAPI from "../../api/authAPI";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Step 1 — Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await AuthAPI.forgotPassword({
        email,
      });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter (A-Z).";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter (a-z).";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number (0-9).";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain at least one special character (@, #, $, etc.).";
    }
    return null;
  };

  // Step 2 — Reset with OTP
  const handleReset = async (e) => {
    e.preventDefault();

    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await AuthAPI.resetPassword({
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        navigate("/login", {
          state: {
            message: "Password reset successfully. " + "Please login.",
          },
        });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
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
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">SHMS</h3>
          <p className="text-muted small">Password Reset</p>
        </div>

        {error && <div className="alert alert-danger py-2">❌ {error}</div>}

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <h5 className="mb-3 fw-bold">Forgot Password</h5>
            <p className="text-muted small mb-3">
              Enter your registered email to receive a reset OTP.
            </p>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset OTP"}
            </button>
            <div className="text-center mt-3">
              <Link to="/login" className="small text-muted">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2 — OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleReset}>
            <h5 className="mb-1 fw-bold">Reset Password</h5>
            <p className="text-muted small mb-3">{message}</p>

            <div className="mb-3">
              <label className="form-label">OTP Code</label>
              <input
                type="text"
                className="form-control
                  text-center fw-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="btn btn-link w-100 mt-1"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
            >
              Request New OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
