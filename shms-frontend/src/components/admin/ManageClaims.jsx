import React, { useState, useEffect } from "react";
import AdminAPI from "../../api/adminAPI";

const ManageClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [approving, setApproving] = useState(null);
  const [approveForm, setApproveForm] = useState({
    approvedAmount: "",
    rejectionReason: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await AdminAPI.getAllClaims();
      setClaims(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    if (!approveForm.approvedAmount) {
      setError("Enter approved amount.");
      return;
    }
    setError("");
    try {
      await AdminAPI.updateClaimStatus(claimId, {
        status: "APPROVED",
        approvedAmount: parseFloat(approveForm.approvedAmount),
      });
      setSuccess(`Claim #${claimId} approved successfully.`);
      setApproving(null);
      setApproveForm({
        approvedAmount: "",
        rejectionReason: "",
      });
      fetchClaims();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to approve claim.");
    }
  };

  const handleReject = async (claimId) => {
    if (!approveForm.rejectionReason) {
      setError("Enter rejection reason.");
      return;
    }
    setError("");
    try {
      await AdminAPI.updateClaimStatus(claimId, {
        status: "REJECTED",
        rejectionReason: approveForm.rejectionReason,
      });
      setSuccess(`Claim #${claimId} rejected.`);
      setApproving(null);
      setApproveForm({
        approvedAmount: "",
        rejectionReason: "",
      });
      fetchClaims();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to reject claim.");
    }
  };

  const statusColor = {
    SUBMITTED: "warning",
    UNDER_REVIEW: "info",
    APPROVED: "success",
    REJECTED: "danger",
    PARTIAL: "secondary",
  };

  const filtered =
    filter === "ALL" ? claims : claims.filter((c) => c.status === filter);

  return (
    <div>
      <h4 className="fw-bold mb-4">🛡️ Insurance Claims</h4>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      {/* Filter */}
      <div className="d-flex gap-2 mb-4">
        {["ALL", "SUBMITTED", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${
              filter === s ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setFilter(s)}
          >
            {s}
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
          <p className="text-muted">No claims found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((claim) => (
            <div key={claim.claimId} className="col-12">
              <div className="card border-0 shadow-sm p-4">
                <div className="row align-items-start">
                  {/* Claim Info */}
                  <div className="col-md-5">
                    <h6 className="fw-bold mb-1">Claim #{claim.claimId}</h6>
                    <p className="text-muted small mb-1">
                      Patient: {claim.patient?.user?.name}
                    </p>
                    <p className="small mb-1">
                      Provider: {claim.insurance?.providerName}
                    </p>
                    <p className="small mb-1">
                      Policy: {claim.insurance?.policyNumber}
                    </p>
                    <p className="small mb-0">
                      Submitted: {claim.submittedAt?.split("T")[0]}
                    </p>
                  </div>

                  {/* Bill Details */}
                  <div className="col-md-4">
                    <p className="small mb-1">
                      <strong>Total Bill:</strong>{" "}
                      <span className="text-danger">
                        ₹{claim.totalBill?.toLocaleString()}
                      </span>
                    </p>
                    <p className="small mb-1">
                      <strong>Claimed:</strong> ₹
                      {claim.claimedAmount?.toLocaleString()}
                    </p>
                    {claim.approvedAmount && (
                      <p className="small mb-1">
                        <strong>Approved:</strong>{" "}
                        <span className="text-success">
                          ₹{claim.approvedAmount?.toLocaleString()}
                        </span>
                      </p>
                    )}
                    {claim.patientCopay && (
                      <p className="small mb-1">
                        <strong>Patient Copay:</strong>{" "}
                        <span className="fw-bold">
                          ₹{claim.patientCopay?.toLocaleString()}
                        </span>
                      </p>
                    )}
                    {claim.rejectionReason && (
                      <p className="small text-danger mb-0">
                        Reason: {claim.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="col-md-3 text-end">
                    <span
                      className={`badge bg-${
                        statusColor[claim.status] || "secondary"
                      } mb-3 d-block`}
                    >
                      {claim.status}
                    </span>

                    {claim.status === "SUBMITTED" && (
                      <button
                        className="btn btn-outline-primary
                          btn-sm w-100"
                        onClick={() => setApproving(claim.claimId)}
                      >
                        Review Claim
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Panel */}
                {approving === claim.claimId && (
                  <div
                    className="mt-3 p-3 rounded"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <h6 className="fw-bold mb-3">
                      Review Claim #{claim.claimId}
                    </h6>
                    <p className="small text-muted mb-3">
                      Total Bill:{" "}
                      <strong>₹{claim.totalBill?.toLocaleString()}</strong>
                    </p>

                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">
                          Approved Amount (₹)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter amount to approve"
                          value={approveForm.approvedAmount}
                          onChange={(e) =>
                            setApproveForm({
                              ...approveForm,
                              approvedAmount: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">
                          Rejection Reason (if rejecting)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter reason..."
                          value={approveForm.rejectionReason}
                          onChange={(e) =>
                            setApproveForm({
                              ...approveForm,
                              rejectionReason: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(claim.claimId)}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReject(claim.claimId)}
                      >
                        ❌ Reject
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setApproving(null);
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

export default ManageClaims;
