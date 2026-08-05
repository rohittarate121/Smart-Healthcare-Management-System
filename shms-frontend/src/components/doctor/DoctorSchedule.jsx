import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorAPI from "../../api/doctorAPI";

const statusColor = {
  CONFIRMED: "success",
  PENDING: "warning",
  COMPLETED: "secondary",
  CANCELLED: "danger",
  CHECKED_IN: "info",
  IN_PROGRESS: "primary",
};

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = () => {
    setLoading(true);
    DoctorAPI.getMySchedule()
      .then((res) => setAppointments(res.data || []))
      .catch(() => setErrorMsg("Failed to load appointments."))
      .finally(() => setLoading(false));
  };

  const handleCancelAppointment = async () => {
    if (!cancellingAppt) return;
    try {
      await DoctorAPI.cancelAppointment(cancellingAppt.apptId, cancelReason);
      setSuccessMsg(`Appointment #${cancellingAppt.apptId} cancelled successfully.`);
      setCancellingAppt(null);
      setCancelReason("");
      fetchSchedule();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Failed to cancel appointment.");
    }
  };

  const filtered =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div>
      <h4 className="fw-bold mb-4">📅 Doctor Appointment Schedule</h4>

      {successMsg && <div className="alert alert-success py-2">✅ {successMsg}</div>}
      {errorMsg && <div className="alert alert-danger py-2">❌ {errorMsg}</div>}

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        {["ALL", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((s) => (
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
        <div className="card border-0 shadow-sm p-5 text-center">
          <p className="text-muted mb-0">No appointments found matching current filter.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((appt) => (
            <div key={appt.apptId} className="col-12">
              <div className="card border-0 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="fw-bold mb-1">{appt.patient?.user?.name}</h6>
                    <p className="text-muted small mb-1">
                      Registration: {appt.patient?.registrationNumber || `Patient #${appt.patient?.patientId}`}
                    </p>
                    <p className="small mb-1">
                      📅 <strong>Date:</strong> {appt.slot?.slotDate} at <strong>{appt.slot?.startTime}</strong>
                    </p>

                    {/* AI Triage Details */}
                    {appt.triageReport && (
                      <div className="mt-2 p-2 bg-light rounded border-start border-3 border-info">
                        <small className="fw-bold text-dark d-block mb-1">
                          🤖 AI Triage Summary:
                        </small>
                        <span
                          className={`badge me-2 ${
                            appt.triageReport.urgencyLevel === "CRITICAL"
                              ? "bg-danger"
                              : appt.triageReport.urgencyLevel === "HIGH"
                              ? "bg-warning text-dark"
                              : "bg-info"
                          }`}
                        >
                          Urgency: {appt.triageReport.urgencyLevel} ({appt.triageReport.severityScore}/100)
                        </span>
                        <small className="text-muted d-block mt-1">
                          Probable Condition: <strong>{appt.triageReport.probableCondition}</strong>
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="text-end">
                    <span
                      className={`badge bg-${
                        statusColor[appt.status] || "secondary"
                      } mb-2 d-block`}
                    >
                      {appt.status}
                    </span>

                    <div className="d-flex gap-1 justify-content-end">
                      {(appt.status === "CONFIRMED" ||
                        appt.status === "CHECKED_IN" ||
                        appt.status === "IN_PROGRESS") && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              navigate(`/doctor/consultation/${appt.apptId}`, {
                                state: { appt },
                              })
                            }
                          >
                            Open Consultation
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => setCancellingAppt(appt)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {cancellingAppt && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Cancel Appointment</h5>
                <button
                  className="btn-close"
                  onClick={() => setCancellingAppt(null)}
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to cancel appointment for{" "}
                  <strong>{cancellingAppt.patient?.user?.name}</strong> at{" "}
                  <strong>{cancellingAppt.slot?.startTime}</strong>?
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Cancellation Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancelling appointment..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCancellingAppt(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelAppointment}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
