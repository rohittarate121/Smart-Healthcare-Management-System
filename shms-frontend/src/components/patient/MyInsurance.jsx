import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";

const MyInsurance = () => {
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    providerName: "",
    policyNumber: "",
    sumInsured: "",
    validFrom: "",
    validUntil: "",
    coverageType: "",
  });

  useEffect(() => {
    fetchInsurance();
  }, []);

  const fetchInsurance = () => {
    PatientAPI.getInsurance()
      .then((res) => setInsurance(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await PatientAPI.addInsurance({
        ...form,
        sumInsured: parseFloat(form.sumInsured),
      });
      setShowForm(false);
      fetchInsurance();
    } catch (err) {
      alert("Failed to add insurance.");
    }
  };

  if (loading) return <p>Loading insurance...</p>;

  return (
    <div>
      <div
        className="d-flex
        justify-content-between mb-4"
      >
        <h4 className="fw-bold">🛡️ My Insurance</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Policy
        </button>
      </div>

      {showForm && (
        <div
          className="card border-0 shadow-sm
          p-4 mb-4"
        >
          <h6 className="fw-bold mb-3">Add Insurance Policy</h6>
          <form onSubmit={handleAdd}>
            <div className="row g-2">
              {[
                {
                  label: "Provider Name",
                  key: "providerName",
                  type: "text",
                },
                {
                  label: "Policy Number",
                  key: "policyNumber",
                  type: "text",
                },
                {
                  label: "Sum Insured (₹)",
                  key: "sumInsured",
                  type: "number",
                },
                {
                  label: "Valid From",
                  key: "validFrom",
                  type: "date",
                },
                {
                  label: "Valid Until",
                  key: "validUntil",
                  type: "date",
                },
                {
                  label: "Coverage Type",
                  key: "coverageType",
                  type: "text",
                },
              ].map((f) => (
                <div key={f.key} className="col-md-6">
                  <label className="form-label small">{f.label}</label>
                  <input
                    type={f.type}
                    className="form-control"
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [f.key]: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-success mt-3">
              Save Policy
            </button>
          </form>
        </div>
      )}

      {insurance.length === 0 ? (
        <div
          className="card border-0 shadow-sm
          p-5 text-center"
        >
          <p className="text-muted">No insurance policies added yet.</p>
        </div>
      ) : (
        insurance.map((ins) => (
          <div
            key={ins.insuranceId}
            className="card border-0 shadow-sm p-3 mb-3"
          >
            <div
              className="d-flex
              justify-content-between"
            >
              <div>
                <h6 className="fw-bold mb-1">{ins.providerName}</h6>
                <p className="small mb-1">Policy: {ins.policyNumber}</p>
                <p className="small mb-1">Coverage: {ins.coverageType}</p>
                <p className="small mb-0">
                  Valid: {ins.validFrom} to {ins.validUntil}
                </p>
              </div>
              <div className="text-end">
                <h5 className="text-success fw-bold">
                  ₹{ins.sumInsured?.toLocaleString()}
                </h5>
                <span
                  className={`badge ${
                    ins.isActive ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {ins.isActive ? "Active" : "Expired"}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyInsurance;
