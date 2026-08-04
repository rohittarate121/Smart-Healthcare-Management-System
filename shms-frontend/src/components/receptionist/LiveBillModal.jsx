import React, { useState, useEffect } from "react";
import BillingAPI from "../../api/billingAPI";

const LiveBillModal = ({ admissionId, onClose, onAddChargeClick, onDischargeClick }) => {
  const [liveBill, setLiveBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLiveBill = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await BillingAPI.getLiveBill(admissionId);
      setLiveBill(res.data);
    } catch (err) {
      setError("Failed to fetch live bill details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admissionId) {
      fetchLiveBill();
    }
  }, [admissionId]);

  if (!admissionId) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              📊 Live Running Bill - Patient: {liveBill ? liveBill.patientName : "..."}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Calculating running charges...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : liveBill ? (
              <>
                {/* Patient Summary Card */}
                <div className="card mb-4 border-0 bg-light shadow-sm">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-1 text-muted small">PATIENT ID / NO.</p>
                        <p className="fw-bold mb-0 text-dark">{liveBill.registrationNumber}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted small">ATTENDING DOCTOR</p>
                        <p className="fw-bold mb-0 text-dark">{liveBill.doctorName}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted small">BED / WARD</p>
                        <p className="fw-bold mb-0 text-dark">{liveBill.bedNumber} ({liveBill.wardName})</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted small">ADMISSION DURATION</p>
                        <p className="fw-bold mb-0 text-dark">
                          {new Date(liveBill.admittedAt).toLocaleDateString()} ({liveBill.daysAdmitted} Days)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Running Total Highlight Banner */}
                <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">Current Running Total</h6>
                    <small className="text-muted">Includes daily room rate @ ₹{liveBill.dailyRoomCharge}/day</small>
                  </div>
                  <span className="fs-3 fw-bold text-primary">₹ {liveBill.runningTotal?.toLocaleString()}</span>
                </div>

                {/* Category Breakdown */}
                {liveBill.categoryBreakdown && Object.keys(liveBill.categoryBreakdown).length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-2 text-secondary">Charges Breakdown by Category</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(liveBill.categoryBreakdown).map(([cat, amt]) => (
                        <span key={cat} className="badge bg-secondary p-2 fs-6 fw-normal">
                          {cat.replace("_", " ")}: <strong>₹{amt}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itemized Charges Table */}
                <h6 className="fw-bold mb-2">Itemized Charges Log</h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle border">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Charge Name</th>
                        <th>Category</th>
                        <th className="text-end">Amount</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveBill.charges && liveBill.charges.length > 0 ? (
                        liveBill.charges.map((chg) => (
                          <tr key={chg.chargeId}>
                            <td className="small text-muted">{new Date(chg.chargeDate).toLocaleDateString()}</td>
                            <td className="fw-semibold">{chg.chargeName}</td>
                            <td>
                              <span className="badge bg-info text-dark">{chg.category}</span>
                            </td>
                            <td className="text-end">₹ {chg.amount}</td>
                            <td className="text-center">{chg.quantity}</td>
                            <td className="text-end fw-bold">₹ {chg.totalAmount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-3">
                            No additional charges logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                onClose();
                if (onAddChargeClick) onAddChargeClick(admissionId);
              }}
            >
              + Add New Charge
            </button>

            {onDischargeClick && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  onClose();
                  onDischargeClick(admissionId);
                }}
              >
                Discharge & Generate Invoice →
              </button>
            )}

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBillModal;
