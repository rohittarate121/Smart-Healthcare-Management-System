import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";

const COVERAGE_TYPES = [
  { value: "Full Coverage", label: "Full Coverage" },
  { value: "Partial Coverage", label: "Partial Coverage" },
  { value: "Cashless", label: "Cashless" },
  { value: "Reimbursement", label: "Reimbursement" },
];

const INSURANCE_TYPES = [
  { value: "Individual", label: "Individual" },
  { value: "Family", label: "Family" },
  { value: "Corporate", label: "Corporate" },
  { value: "Government", label: "Government" },
];

const MyInsurance = () => {
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    providerName: "",
    policyNumber: "",
    sumInsured: "",
    validFrom: "",
    validUntil: "",
    coverageType: "Cashless",
    insuranceType: "Individual",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchInsurance();
  }, []);

  const fetchInsurance = () => {
    PatientAPI.getInsurance()
      .then((res) => setInsurance(res.data || []))
      .catch(() => setError("Failed to load insurance policies."))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!form.providerName || !form.providerName.trim()) {
      errors.providerName = "Insurance provider name is required";
    }

    if (!form.policyNumber || !form.policyNumber.trim()) {
      errors.policyNumber = "Policy number is required";
    } else {
      const cleanPolicy = form.policyNumber.trim();
      if (!/^[a-zA-Z0-9]{8,13}$/.test(cleanPolicy)) {
        errors.policyNumber = "Policy number must be 8 to 13 alphanumeric characters";
      }
    }

    if (!form.sumInsured || Number(form.sumInsured) <= 0) {
      errors.sumInsured = "Sum insured must be a positive amount";
    }

    if (!form.validFrom) {
      errors.validFrom = "Valid from date is required";
    }

    if (!form.validUntil) {
      errors.validUntil = "Expiry date is required";
    } else {
      const expiryDate = new Date(form.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        errors.validUntil = "Policy is already expired! Select a future date";
      }
    }

    if (!form.coverageType) {
      errors.coverageType = "Coverage type selection is required";
    }

    if (!form.insuranceType) {
      errors.insuranceType = "Insurance type selection is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix all form validation errors before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await PatientAPI.addInsurance({
        providerName: form.providerName.trim(),
        policyNumber: form.policyNumber.trim(),
        sumInsured: parseFloat(form.sumInsured),
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        coverageType: form.coverageType,
        insuranceType: form.insuranceType,
      });

      setSuccess("Insurance policy added successfully.");
      setShowForm(false);
      setForm({
        providerName: "",
        policyNumber: "",
        sumInsured: "",
        validFrom: "",
        validUntil: "",
        coverageType: "Cashless",
        insuranceType: "Individual",
      });
      fetchInsurance();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add insurance policy. Please check inputs."
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
        <h4 className="fw-bold mb-0">🛡️ My Insurance Policies</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setShowForm(!showForm);
            setFieldErrors({});
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Policy"}
        </button>
      </div>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      {showForm && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ maxWidth: "720px" }}>
          <h6 className="fw-bold mb-3">Add New Insurance Policy</h6>
          <form onSubmit={handleAdd}>
            <div className="row g-3">
              {/* Provider Name */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Insurance Provider <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="providerName"
                  className={`form-control ${fieldErrors.providerName ? "is-invalid" : ""}`}
                  value={form.providerName}
                  onChange={handleChange}
                  placeholder="e.g. Star Health, HDFC ERGO"
                />
                {fieldErrors.providerName && (
                  <div className="invalid-feedback">{fieldErrors.providerName}</div>
                )}
              </div>

              {/* Policy Number */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Policy Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  className={`form-control ${fieldErrors.policyNumber ? "is-invalid" : ""}`}
                  value={form.policyNumber}
                  onChange={handleChange}
                  placeholder="8-13 alphanumeric characters"
                  maxLength={13}
                />
                {fieldErrors.policyNumber && (
                  <div className="invalid-feedback">{fieldErrors.policyNumber}</div>
                )}
              </div>

              {/* Coverage Type Dropdown */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Coverage Type <span className="text-danger">*</span>
                </label>
                <select
                  name="coverageType"
                  className={`form-select ${fieldErrors.coverageType ? "is-invalid" : ""}`}
                  value={form.coverageType}
                  onChange={handleChange}
                >
                  {COVERAGE_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.coverageType && (
                  <div className="invalid-feedback">{fieldErrors.coverageType}</div>
                )}
              </div>

              {/* Insurance Type Dropdown */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Insurance Type <span className="text-danger">*</span>
                </label>
                <select
                  name="insuranceType"
                  className={`form-select ${fieldErrors.insuranceType ? "is-invalid" : ""}`}
                  value={form.insuranceType}
                  onChange={handleChange}
                >
                  {INSURANCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.insuranceType && (
                  <div className="invalid-feedback">{fieldErrors.insuranceType}</div>
                )}
              </div>

              {/* Sum Insured */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Sum Insured (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="sumInsured"
                  className={`form-control ${fieldErrors.sumInsured ? "is-invalid" : ""}`}
                  value={form.sumInsured}
                  onChange={handleChange}
                  placeholder="e.g. 500000"
                  min="1"
                />
                {fieldErrors.sumInsured && (
                  <div className="invalid-feedback">{fieldErrors.sumInsured}</div>
                )}
              </div>

              {/* Valid From */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Valid From <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="validFrom"
                  className={`form-control ${fieldErrors.validFrom ? "is-invalid" : ""}`}
                  value={form.validFrom}
                  onChange={handleChange}
                />
                {fieldErrors.validFrom && (
                  <div className="invalid-feedback">{fieldErrors.validFrom}</div>
                )}
              </div>

              {/* Valid Until / Expiry Date */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Expiry Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="validUntil"
                  className={`form-control ${fieldErrors.validUntil ? "is-invalid" : ""}`}
                  value={form.validUntil}
                  onChange={handleChange}
                />
                {fieldErrors.validUntil && (
                  <div className="invalid-feedback">{fieldErrors.validUntil}</div>
                )}
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={saving}>
                {saving ? "Saving..." : "💾 Save Policy"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {insurance.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <p className="text-muted mb-0">No active insurance policies added yet.</p>
        </div>
      ) : (
        insurance.map((ins) => {
          const isExpired = new Date(ins.validUntil) < new Date();
          return (
            <div key={ins.insuranceId} className="card border-0 shadow-sm p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1">{ins.providerName}</h6>
                  <p className="small mb-1">
                    <strong>Policy No:</strong> {ins.policyNumber}
                  </p>
                  <p className="small mb-1">
                    <strong>Coverage:</strong> {ins.coverageType} |{" "}
                    <strong>Type:</strong> {ins.insuranceType || "Individual"}
                  </p>
                  <p className="small mb-0 text-muted">
                    Valid: {ins.validFrom || "N/A"} to {ins.validUntil}
                  </p>
                </div>
                <div className="text-end">
                  <h5 className="text-success fw-bold mb-1">
                    ₹{ins.sumInsured?.toLocaleString()}
                  </h5>
                  <span
                    className={`badge ${
                      ins.isActive && !isExpired ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {ins.isActive && !isExpired ? "Active" : "Expired"}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyInsurance;
