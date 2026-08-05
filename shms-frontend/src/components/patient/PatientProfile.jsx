import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";
import {
  COUNTRY_CODES,
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateCity,
  validateState,
  validateCountry,
  validatePincode,
  validateDOB,
  validateGender,
  validateEmergencyContact,
} from "../../utils/validation";

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "Maharashtra",
    country: "India",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await PatientAPI.getProfile();
      const p = res.data;
      setProfile(p);
      setForm({
        name: p.user?.name || "",
        email: p.user?.email || "",
        countryCode: p.countryCode || "+91",
        phone: p.user?.phone || "",
        dateOfBirth: p.dateOfBirth || "",
        gender: p.gender || "",
        bloodGroup: p.bloodGroup || "",
        address: p.address || "",
        city: p.city || "",
        state: p.state || "Maharashtra",
        country: p.country || "India",
        pincode: p.pincode || "",
        emergencyContactName: p.emergencyContactName || "",
        emergencyContactPhone: p.emergencyContactPhone || "",
      });
    } catch (err) {
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(form.phone, form.countryCode);
    if (phoneErr) errors.phone = phoneErr;

    const dobErr = validateDOB(form.dateOfBirth);
    if (dobErr) errors.dateOfBirth = dobErr;

    const genderErr = validateGender(form.gender);
    if (genderErr) errors.gender = genderErr;

    const addrErr = validateAddress(form.address);
    if (addrErr) errors.address = addrErr;

    const cityErr = validateCity(form.city);
    if (cityErr) errors.city = cityErr;

    const stateErr = validateState(form.state);
    if (stateErr) errors.state = stateErr;

    const countryErr = validateCountry(form.country);
    if (countryErr) errors.country = countryErr;

    const pinErr = validatePincode(form.pincode);
    if (pinErr) errors.pincode = pinErr;

    const emergencyErrs = validateEmergencyContact(
      form.emergencyContactName,
      form.emergencyContactPhone,
      form.countryCode
    );

    if (emergencyErrs.name) errors.emergencyContactName = emergencyErrs.name;
    if (emergencyErrs.phone) errors.emergencyContactPhone = emergencyErrs.phone;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError("Please fix all form validation errors before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await PatientAPI.updateProfile(form);
      setProfile(res.data);
      setEditing(false);
      setSuccess("Patient profile updated successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Profile update failed. Please check inputs."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">👤 Patient Profile & Registration</h4>
        <button
          className={`btn btn-sm ${
            editing ? "btn-outline-secondary" : "btn-outline-primary"
          }`}
          onClick={() => {
            setEditing(!editing);
            setFieldErrors({});
            setError("");
          }}
        >
          {editing ? "Cancel Edit" : "✏️ Edit Profile"}
        </button>
      </div>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      <div className="card border-0 shadow-sm p-4">
        <div className="row g-3">
          {/* Full Name */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Full Name <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
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
            ) : (
              <p className="fw-semibold mb-0">{profile?.user?.name || "—"}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Email Address <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  disabled
                />
                <small className="text-muted">Email cannot be changed directly.</small>
              </div>
            ) : (
              <p className="fw-semibold mb-0">{profile?.user?.email || "—"}</p>
            )}
          </div>

          {/* Phone Number with Country Code */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Mobile Number <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
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
            ) : (
              <p className="fw-semibold mb-0">
                {form.countryCode} {profile?.user?.phone || "—"}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Date of Birth <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="date"
                  name="dateOfBirth"
                  className={`form-control ${fieldErrors.dateOfBirth ? "is-invalid" : ""}`}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
                {fieldErrors.dateOfBirth && (
                  <div className="invalid-feedback">{fieldErrors.dateOfBirth}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">{profile?.dateOfBirth || "—"}</p>
            )}
          </div>

          {/* Gender */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Gender <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <select
                  name="gender"
                  className={`form-select ${fieldErrors.gender ? "is-invalid" : ""}`}
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {fieldErrors.gender && (
                  <div className="invalid-feedback">{fieldErrors.gender}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">
                {profile?.gender === "M"
                  ? "Male"
                  : profile?.gender === "F"
                  ? "Female"
                  : profile?.gender === "OTHER"
                  ? "Other"
                  : "—"}
              </p>
            )}
          </div>

          {/* Blood Group */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Blood Group
            </label>
            {editing ? (
              <select
                name="bloodGroup"
                className="form-select"
                value={form.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            ) : (
              <p className="fw-semibold mb-0">{profile?.bloodGroup || "—"}</p>
            )}
          </div>

          {/* Address */}
          <div className="col-12">
            <label className="form-label small text-muted fw-semibold">
              Address <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <textarea
                  name="address"
                  className={`form-control ${fieldErrors.address ? "is-invalid" : ""}`}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter street address, building, apartment..."
                  rows={2}
                />
                {fieldErrors.address && (
                  <div className="invalid-feedback">{fieldErrors.address}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">{profile?.address || "—"}</p>
            )}
          </div>

          {/* City */}
          <div className="col-md-4">
            <label className="form-label small text-muted fw-semibold">
              City <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  name="city"
                  className={`form-control ${fieldErrors.city ? "is-invalid" : ""}`}
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
                {fieldErrors.city && (
                  <div className="invalid-feedback">{fieldErrors.city}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">{profile?.city || "—"}</p>
            )}
          </div>

          {/* State */}
          <div className="col-md-4">
            <label className="form-label small text-muted fw-semibold">
              State <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  name="state"
                  className={`form-control ${fieldErrors.state ? "is-invalid" : ""}`}
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
                {fieldErrors.state && (
                  <div className="invalid-feedback">{fieldErrors.state}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">{form.state || "Maharashtra"}</p>
            )}
          </div>

          {/* Pincode */}
          <div className="col-md-4">
            <label className="form-label small text-muted fw-semibold">
              Pincode <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  name="pincode"
                  className={`form-control ${fieldErrors.pincode ? "is-invalid" : ""}`}
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {fieldErrors.pincode && (
                  <div className="invalid-feedback">{fieldErrors.pincode}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">{profile?.pincode || "—"}</p>
            )}
          </div>

          {/* Emergency Contact Name */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Emergency Contact Name <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  name="emergencyContactName"
                  className={`form-control ${fieldErrors.emergencyContactName ? "is-invalid" : ""}`}
                  value={form.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact person name"
                />
                {fieldErrors.emergencyContactName && (
                  <div className="invalid-feedback">{fieldErrors.emergencyContactName}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">
                {profile?.emergencyContactName || "—"}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div className="col-md-6">
            <label className="form-label small text-muted fw-semibold">
              Emergency Contact Phone <span className="text-danger">*</span>
            </label>
            {editing ? (
              <div>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className={`form-control ${fieldErrors.emergencyContactPhone ? "is-invalid" : ""}`}
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {fieldErrors.emergencyContactPhone && (
                  <div className="invalid-feedback">{fieldErrors.emergencyContactPhone}</div>
                )}
              </div>
            ) : (
              <p className="fw-semibold mb-0">
                {profile?.emergencyContactPhone || "—"}
              </p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-4 d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Profile Changes"}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setEditing(false);
                setFieldErrors({});
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-muted small">
        Registration Number:{" "}
        <strong>{profile?.registrationNumber || "SHMS-PATIENT"}</strong>
      </div>
    </div>
  );
};

export default PatientProfile;
