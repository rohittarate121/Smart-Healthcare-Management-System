import React, { useState, useEffect } from "react";
import AdminAPI from "../../api/adminAPI";

const ManageAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE");
  const [discharging, setDischarging] = useState(null);
  const [summary, setSummary] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [admRes, bedRes] = await Promise.allSettled([
        AdminAPI.getAllAdmissions(),
        AdminAPI.getAvailableBeds(),
      ]);

      if (admRes.status === "fulfilled") {
        setAdmissions(
          Array.isArray(admRes.value.data) ? admRes.value.data : [],
        );
      }

      if (bedRes.status === "fulfilled") {
        setBeds(Array.isArray(bedRes.value.data) ? bedRes.value.data : []);
      }
    } catch (err) {
      console.error("Failed to load admissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async (admissionId) => {
    if (!summary.trim()) {
      setError("Enter discharge summary.");
      return;
    }
    setError("");
    try {
      const res = await AdminAPI.initiateDischarge(admissionId, {
        dischargeSummary: summary,
      });
      setSuccess(res.data.message || "Discharge initiated. Bill generated.");
      setDischarging(null);
      setSummary("");
      fetchData();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Discharge failed.");
    }
  };

  const filtered =
    filter === "ACTIVE"
      ? admissions.filter((a) => a.status === "ADMITTED")
      : filter === "DISCHARGED"
        ? admissions.filter((a) => a.status === "DISCHARGED")
        : admissions;

  return (
    <div>
      <h4 className="fw-bold mb-2">🏥 Manage Admissions</h4>

      {/* Bed availability summary */}
      <div
        className="p-3 rounded mb-4 d-flex gap-3"
        style={{ backgroundColor: "#e8f5e9" }}
      >
        <span className="text-success fw-bold">
          🛏️ Available Beds: {beds.length}
        </span>
        <span className="text-muted">|</span>
        <span>
          Active Admissions:{" "}
          {admissions.filter((a) => a.status === "ADMITTED").length}
        </span>
      </div>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      {/* Filter */}
      <div className="d-flex gap-2 mb-4">
        {["ALL", "ACTIVE", "DISCHARGED"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${
              filter === f ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card border-0 shadow-sm
          p-5 text-center"
        >
          <p className="text-muted">No admissions found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((adm) => (
            <div key={adm.admissionId} className="col-12">
              <div className="card border-0 shadow-sm p-4">
                <div className="row align-items-start">
                  <div className="col-md-4">
                    <h6 className="fw-bold mb-1">{adm.patient?.user?.name}</h6>
                    <p className="text-muted small mb-1">
                      {adm.patient?.registrationNumber}
                    </p>
                    <p className="small mb-1">
                      Doctor: {adm.doctor?.user?.name}
                    </p>
                    <p className="small mb-0">
                      Admitted: {adm.admittedAt?.split("T")[0]}
                    </p>
                  </div>

                  <div className="col-md-4">
                    <p className="small mb-1">
                      <strong>Ward:</strong> {adm.bed?.ward?.name || "N/A"}
                    </p>
                    <p className="small mb-1">
                      <strong>Bed:</strong> {adm.bed?.bedNumber} (
                      {adm.bed?.bedType})
                    </p>
                    <p className="small mb-1">
                      <strong>Daily Charge:</strong> ₹
                      {adm.bed?.dailyCharge?.toLocaleString()}
                    </p>
                    {adm.admissionReason && (
                      <p
                        className="small mb-0
                        text-muted"
                      >
                        Reason: {adm.admissionReason}
                      </p>
                    )}
                  </div>

                  <div className="col-md-4 text-end">
                    <span
                      className={`badge mb-3 d-block ${
                        adm.status === "ADMITTED"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {adm.status}
                    </span>

                    {adm.status === "ADMITTED" && (
                      <button
                        className="btn
                          btn-outline-warning
                          btn-sm w-100"
                        onClick={() => setDischarging(adm.admissionId)}
                      >
                        🏁 Initiate Discharge
                      </button>
                    )}

                    {adm.status === "DISCHARGED" && adm.dischargedAt && (
                      <p className="small text-muted">
                        Discharged: {adm.dischargedAt.split("T")[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Discharge Panel */}
                {discharging === adm.admissionId && (
                  <div
                    className="mt-3 p-3 rounded"
                    style={{
                      backgroundColor: "#fff3e0",
                    }}
                  >
                    <h6 className="fw-bold mb-2">Initiate Discharge</h6>
                    <div className="mb-2">
                      <label className="form-label small">
                        Discharge Summary
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Enter discharge summary and instructions..."
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleDischarge(adm.admissionId)}
                      >
                        Generate Bill & Discharge
                      </button>
                      <button
                        className="btn
                          btn-outline-secondary"
                        onClick={() => {
                          setDischarging(null);
                          setSummary("");
                          setError("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAdmissions;
