import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorAPI from "../../api/doctorAPI";

const DoctorProfilePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialization: "",
    qualification: "",
    experienceYears: "",
    registrationNo: "",
    consultationFee: "",
    bio: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const res = await DoctorAPI.getProfile();
      if (res.data) {
        setForm({
          specialization: res.data.specialization || "",
          qualification: res.data.qualification || "",
          experienceYears: res.data.experienceYears ?? "",
          registrationNo: res.data.registrationNo || "",
          consultationFee: res.data.consultationFee ?? "",
          bio: res.data.bio || "",
        });
      }
    } catch (err) {
      console.log("No existing profile found or failed to load:", err);
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
    if (!form.specialization || !form.specialization.trim()) {
      errors.specialization = "Specialization is required (e.g. Cardiology)";
    }
    if (!form.registrationNo || !form.registrationNo.trim()) {
      errors.registrationNo = "Medical registration number is required";
    }
    if (form.experienceYears !== "" && Number(form.experienceYears) < 0) {
      errors.experienceYears = "Experience years cannot be negative";
    }
    if (form.consultationFee !== "" && Number(form.consultationFee) < 0) {
      errors.consultationFee = "Consultation fee cannot be negative";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix all form errors before submitting.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
        registrationNo: form.registrationNo.trim(),
        consultationFee: form.consultationFee ? Number(form.consultationFee) : null,
        bio: form.bio.trim(),
      };

      await DoctorAPI.createProfile(payload);
      setSuccess("Doctor profile saved successfully. Redirecting...");
      setTimeout(() => navigate("/doctor/schedule"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save doctor profile.");
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
      <h4 className="fw-bold mb-4">🩺 Doctor Profile & Credentials</h4>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 720 }}>
        <p className="text-muted small mb-4">
          Pre-filled with existing details. Update your clinical profile and consultation fee below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Specialization <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="specialization"
                className={`form-control ${fieldErrors.specialization ? "is-invalid" : ""}`}
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
              />
              {fieldErrors.specialization && (
                <div className="invalid-feedback">{fieldErrors.specialization}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Qualification</label>
              <input
                type="text"
                name="qualification"
                className="form-control"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD, DM"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Experience (Years)</label>
              <input
                type="number"
                name="experienceYears"
                className={`form-control ${fieldErrors.experienceYears ? "is-invalid" : ""}`}
                value={form.experienceYears}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 10"
              />
              {fieldErrors.experienceYears && (
                <div className="invalid-feedback">{fieldErrors.experienceYears}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">
                Registration No. <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="registrationNo"
                className={`form-control ${fieldErrors.registrationNo ? "is-invalid" : ""}`}
                value={form.registrationNo}
                onChange={handleChange}
                placeholder="e.g. MCI-98765"
              />
              {fieldErrors.registrationNo && (
                <div className="invalid-feedback">{fieldErrors.registrationNo}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Consultation Fee (₹)</label>
              <input
                type="number"
                name="consultationFee"
                className={`form-control ${fieldErrors.consultationFee ? "is-invalid" : ""}`}
                value={form.consultationFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 500"
              />
              {fieldErrors.consultationFee && (
                <div className="invalid-feedback">{fieldErrors.consultationFee}</div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Bio / Professional Summary</label>
              <textarea
                name="bio"
                className="form-control"
                value={form.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your expertise, clinical interests, and background..."
              />
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Doctor Profile"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/doctor/schedule")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
