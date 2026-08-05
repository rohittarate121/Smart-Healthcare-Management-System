import React, { useState } from "react";
import AdminAPI from "../../api/adminAPI";
import {
  COUNTRY_CODES,
  validateName,
  validateEmail,
  validatePhone,
} from "../../utils/validation";

const CreateStaff = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    password: "",
    role: "DOCTOR",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError("");
  };

  const validatePassword = (pwd) => {
    if (!pwd) return "Temporary password is required";
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter (A-Z)";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter (a-z)";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number (0-9)";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character (@, #, $, etc.)";
    return null;
  };

  const validateForm = () => {
    const errors = {};
    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(form.phone, form.countryCode);
    if (phoneErr) errors.phone = phoneErr;

    const pwdErr = validatePassword(form.password);
    if (pwdErr) errors.password = pwdErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix form validation errors before creating staff account.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await AdminAPI.createStaff(form);
      if (res.data.success) {
        setSuccess(
          `${form.role} account created successfully for ${form.name}. Email: ${form.email}`
        );

        setForm({
          name: "",
          email: "",
          countryCode: "+91",
          phone: "",
          password: "",
          role: "DOCTOR",
        });
      } else {
        setError(res.data.message || "Failed to create staff account.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create staff account. Duplicate email or phone."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">➕ Create Staff Account</h4>

      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: "560px" }}>
        {success && <div className="alert alert-success py-2">✅ {success}</div>}
        {error && <div className="alert alert-danger py-2">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Role <span className="text-danger">*</span>
            </label>
            <select
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="LAB_TECH">Lab Technician</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {fieldErrors.name && (
              <div className="invalid-feedback">{fieldErrors.name}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              placeholder="staff@hospital.com"
            />
            {fieldErrors.email && (
              <div className="invalid-feedback">{fieldErrors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Phone Number <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <select
                name="countryCode"
                className="form-select flex-grow-0"
                style={{ width: "130px" }}
                value={form.countryCode}
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
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
              />
            </div>
            {fieldErrors.phone && (
              <div className="text-danger small mt-1">{fieldErrors.phone}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">
              Temporary Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              name="password"
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              value={form.password}
              onChange={handleChange}
              placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special"
            />
            {fieldErrors.password ? (
              <div className="invalid-feedback">{fieldErrors.password}</div>
            ) : (
              <small className="text-muted">
                Must contain upper case, lower case, number, and special char.
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Creating Account..." : `Create ${form.role} Account`}
          </button>
        </form>
      </div>

      <div
        className="mt-4 p-3 rounded"
        style={{
          backgroundColor: "#e8f4fd",
          maxWidth: "560px",
        }}
      >
        <h6 className="fw-bold mb-2">📋 Staff Registration Rules</h6>
        <ul className="small text-muted mb-0">
          <li>Pre-verified staff account — no OTP requirement at initial login</li>
          <li>Supported Roles: Doctor, Receptionist, Lab Technician</li>
          <li>Mobile numbers must match selected country pattern (+91 India 10 digits)</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateStaff;
