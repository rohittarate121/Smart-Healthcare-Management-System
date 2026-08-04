import React, { useState } from "react";
import AdminAPI from "../../api/adminAPI";

const CreateStaff = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "DOCTOR",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pwdErr = validatePassword(form.password);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await AdminAPI.createStaff(form);
      if (res.data.success) {
        setSuccess(
          `${form.role} account created for ${form.name}. ` +
            `Email: ${form.email} | ` +
            `Password: ${form.password} | ` +
            `${
              form.role === "DOCTOR"
                ? "Note: Doctor must login and complete their profile at /api/doctors/profile"
                : ""
            }`,
        );

        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "DOCTOR",
        });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create staff account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">➕ Create Staff Account</h4>

      <div
        className="card border-0 shadow-sm p-4"
        style={{ maxWidth: "540px" }}
      >
        {success && (
          <div className="alert alert-success py-2">✅ {success}</div>
        )}
        {error && <div className="alert alert-danger py-2">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Role</label>
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
            <small className="text-muted">
              Admin can create: Doctor, Receptionist, Lab Tech only.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone (10 digits)</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              maxLength={10}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Temporary Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />
            <small className="text-muted">
              Staff should change this after first login.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Creating..." : `Create ${form.role} Account`}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div
        className="mt-4 p-3 rounded"
        style={{
          backgroundColor: "#e8f4fd",
          maxWidth: "540px",
        }}
      >
        <h6 className="fw-bold mb-2">📋 Staff Account Rules</h6>
        <ul className="small text-muted mb-0">
          <li>Staff accounts are pre-verified — no OTP required at login</li>
          <li>ADMIN can create: Doctor, Receptionist, Lab Tech</li>
          <li>Only SUPER_ADMIN can create ADMIN accounts</li>
          <li>Staff login uses the same login page as patients</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateStaff;
