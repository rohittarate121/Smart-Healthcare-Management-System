import React, { useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.specialization || !form.registrationNo) {
      setError("Specialization and registration number are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        specialization: form.specialization,
        qualification: form.qualification,
        experienceYears: form.experienceYears
          ? Number(form.experienceYears)
          : null,
        registrationNo: form.registrationNo,
        consultationFee: form.consultationFee
          ? Number(form.consultationFee)
          : null,
        bio: form.bio,
      };

      await DoctorAPI.createProfile(payload);
      setSuccess(
        "Doctor profile created successfully. Redirecting to slots...",
      );
      setForm({
        specialization: "",
        qualification: "",
        experienceYears: "",
        registrationNo: "",
        consultationFee: "",
        bio: "",
      });
      setTimeout(() => navigate("/doctor/slots"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">👤 Complete Doctor Profile</h4>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 720 }}>
        <p className="text-muted">
          Complete your doctor profile before adding availability slots.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                className="form-control"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                name="qualification"
                className="form-control"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Experience Years</label>
              <input
                type="number"
                name="experienceYears"
                className="form-control"
                value={form.experienceYears}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 5"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Registration No.</label>
              <input
                type="text"
                name="registrationNo"
                className="form-control"
                value={form.registrationNo}
                onChange={handleChange}
                placeholder="e.g. MH-123456"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Consultation Fee</label>
              <input
                type="number"
                name="consultationFee"
                className="form-control"
                value={form.consultationFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 500"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                className="form-control"
                value={form.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell patients a little about yourself"
              />
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
