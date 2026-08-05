import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import {
  COUNTRY_CODES,
  validateName,
  validateEmail,
  validatePhone,
} from "../../utils/validation";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError("");
  };

  const validatePassword = (pwd) => {
    if (!pwd) return "Password is required";
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

  const validateForm = () => {
    const errors = {};

    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(formData.phone, formData.countryCode);
    if (phoneErr) errors.phone = phoneErr;

    const pwdErr = validatePassword(formData.password);
    if (pwdErr) errors.password = pwdErr;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix form validation errors before registering.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await AuthAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess(response.data.message || "Registration successful!");
        setTimeout(() => {
          navigate("/login", {
            state: { message: "Registration successful. Please login." },
          });
        }, 1500);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please check your mobile number/email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f0f9ff" }}
    >
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "480px" }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">SHMS</h3>
          <p className="text-muted small">Patient Self-Registration</p>
        </div>

        {error && <div className="alert alert-danger py-2">❌ {error}</div>}
        {success && <div className="alert alert-success py-2">✅ {success}</div>}

        <form onSubmit={handleRegister}>
          <h5 className="mb-3 fw-bold">Create Patient Account</h5>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
              placeholder="Enter full name (alphabets only)"
              value={formData.name}
              onChange={handleChange}
            />
            {fieldErrors.name && (
              <div className="invalid-feedback">{fieldErrors.name}</div>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              placeholder="patient@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <div className="invalid-feedback">{fieldErrors.email}</div>
            )}
          </div>

          {/* Phone Number with Country Code */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Mobile Number <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <select
                name="countryCode"
                className="form-select flex-grow-0"
                style={{ width: "130px" }}
                value={formData.countryCode}
                onChange={handleChange}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                className={`form-control ${fieldErrors.phone ? "is-invalid" : ""}`}
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.phone && (
              <div className="text-danger small mt-1">{fieldErrors.phone}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              name="password"
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
            {fieldErrors.password ? (
              <div className="invalid-feedback">{fieldErrors.password}</div>
            ) : (
              <div className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                Must contain 8+ chars, 1 uppercase, 1 lowercase, 1 number &amp; 1 special char.
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label small fw-semibold">
              Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-control ${fieldErrors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {fieldErrors.confirmPassword && (
              <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="small fw-bold">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
