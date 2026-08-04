import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
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
      setProfile(res.data);
      setForm({
        dateOfBirth: res.data.dateOfBirth || "",
        gender: res.data.gender || "",
        bloodGroup: res.data.bloodGroup || "",
        address: res.data.address || "",
        city: res.data.city || "",
        pincode: res.data.pincode || "",
        emergencyContactName: res.data.emergencyContactName || "",
        emergencyContactPhone: res.data.emergencyContactPhone || "",
      });
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await PatientAPI.updateProfile(form);
      setProfile(res.data);
      setEditing(false);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Update failed. Please try again.",
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
      <div
        className="d-flex
        justify-content-between mb-4"
      >
        <h4 className="fw-bold">👤 My Profile</h4>
        <button
          className={`btn btn-sm ${
            editing ? "btn-outline-secondary" : "btn-outline-primary"
          }`}
          onClick={() => {
            setEditing(!editing);
            setError("");
          }}
        >
          {editing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}

      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      <div className="card border-0 shadow-sm p-4">
        <div className="row g-3">
          {/* Date of Birth */}
          <div className="col-md-6">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              Date of Birth
            </label>
            {editing ? (
              <input
                type="date"
                name="dateOfBirth"
                className="form-control"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            ) : (
              <p className="fw-semibold mb-0">{profile?.dateOfBirth || "—"}</p>
            )}
          </div>

          {/* Gender — dropdown for enum */}
          <div className="col-md-6">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              Gender
            </label>
            {editing ? (
              <select
                name="gender"
                className="form-select"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="OTHER">Other</option>
              </select>
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
            <label
              className="form-label small
              text-muted fw-semibold"
            >
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
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ),
                )}
              </select>
            ) : (
              <p className="fw-semibold mb-0">{profile?.bloodGroup || "—"}</p>
            )}
          </div>

          {/* City */}
          <div className="col-md-6">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              City
            </label>
            {editing ? (
              <input
                type="text"
                name="city"
                className="form-control"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            ) : (
              <p className="fw-semibold mb-0">{profile?.city || "—"}</p>
            )}
          </div>

          {/* Pincode */}
          <div className="col-md-6">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              Pincode
            </label>
            {editing ? (
              <input
                type="text"
                name="pincode"
                className="form-control"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength={6}
              />
            ) : (
              <p className="fw-semibold mb-0">{profile?.pincode || "—"}</p>
            )}
          </div>

          {/* Address */}
          <div className="col-12">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              Address
            </label>
            {editing ? (
              <textarea
                name="address"
                className="form-control"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows={2}
              />
            ) : (
              <p className="fw-semibold mb-0">{profile?.address || "—"}</p>
            )}
          </div>

          {/* Emergency Contact Name */}
          <div className="col-md-6">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              Emergency Contact Name
            </label>
            {editing ? (
              <input
                type="text"
                name="emergencyContactName"
                className="form-control"
                value={form.emergencyContactName}
                onChange={handleChange}
                placeholder="Contact person name"
              />
            ) : (
              <p className="fw-semibold mb-0">
                {profile?.emergencyContactName || "—"}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div className="col-md-6">
            <label
              className="form-label small
              text-muted fw-semibold"
            >
              Emergency Contact Phone
            </label>
            {editing ? (
              <input
                type="tel"
                name="emergencyContactPhone"
                className="form-control"
                value={form.emergencyContactPhone}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength={10}
              />
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
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setEditing(false);
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
        <strong>{profile?.registrationNumber || "Not assigned"}</strong>
      </div>
    </div>
  );
};

export default PatientProfile;
