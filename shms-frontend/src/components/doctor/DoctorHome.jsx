import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DoctorAPI from "../../api/doctorAPI";

const DoctorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await DoctorAPI.getMySchedule();
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to load doctor schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancellingAppt) return;
    try {
      await DoctorAPI.cancelAppointment(cancellingAppt.apptId, cancelReason);
      setActionSuccess(`Appointment #${cancellingAppt.apptId} cancelled successfully.`);
      setCancellingAppt(null);
      setCancelReason("");
      fetchSchedule();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  // Filter today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(
    (a) => a.slot?.slotDate === today && a.status !== "CANCELLED"
  );

  // Stats
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const checkedIn = appointments.filter((a) => a.status === "CHECKED_IN").length;

  return (
    <div>
      <h4 className="fw-bold mb-1">Welcome, Dr. {user?.name} 👨‍⚕️</h4>
      <p className="text-muted mb-4">Doctor Clinical Dashboard & Patient Queue</p>

      {actionSuccess && <div className="alert alert-success py-2">✅ {actionSuccess}</div>}
      {actionError && <div className="alert alert-danger py-2">❌ {actionError}</div>}

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Today's Appointments",
            value: todayAppts.length,
            color: "#0d6efd",
            icon: "📅",
          },
          {
            label: "Waiting (Checked In)",
            value: checkedIn,
            color: "#fd7e14",
            icon: "⏳",
          },
          {
            label: "Confirmed",
            value: confirmed,
            color: "#198754",
            icon: "✅",
          },
          {
            label: "Completed Today",
            value: completed,
            color: "#6f42c1",
            icon: "🏁",
          },
        ].map((stat) => (
          <div key={stat.label} className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <div style={{ fontSize: "2rem" }}>{stat.icon}</div>
              <h3 className="fw-bold mb-0" style={{ color: stat.color }}>
                {stat.value}
              </h3>
              <p className="text-muted small mb-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Patient Queue */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-bold border-0 pt-3 d-flex justify-content-between align-items-center">
          <span>📋 Today's Patient Queue</span>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchSchedule}>
            🔄 Refresh Queue
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : todayAppts.length === 0 ? (
            <p className="text-muted text-center py-4 mb-0">
              No active appointments scheduled for today.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>Patient Info</th>
                    <th>Type</th>
                    <th>AI Triage Report</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.map((appt) => (
                    <tr key={appt.apptId}>
                      <td className="fw-bold">{appt.slot?.startTime}</td>
                      <td>
                        <strong>{appt.patient?.user?.name}</strong>
                        <br />
                        <small className="text-muted">
                          {appt.patient?.registrationNumber || `Patient #${appt.patient?.patientId}`}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-primary">{appt.apptType || "OPD"}</span>
                      </td>
                      <td>
                        {appt.triageReport ? (
                          <div>
                            <span
                              className={`badge me-1 ${
                                appt.triageReport.urgencyLevel === "CRITICAL"
                                  ? "bg-danger"
                                  : appt.triageReport.urgencyLevel === "HIGH"
                                  ? "bg-warning text-dark"
                                  : "bg-info"
                              }`}
                            >
                              {appt.triageReport.urgencyLevel} ({appt.triageReport.severityScore}/100)
                            </span>
                            <br />
                            <small className="text-muted d-block mt-1">
                              <strong>Condition:</strong> {appt.triageReport.probableCondition}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted small">No AI Triage Report</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            appt.status === "CONFIRMED"
                              ? "bg-success"
                              : appt.status === "CHECKED_IN"
                              ? "bg-warning text-dark"
                              : appt.status === "IN_PROGRESS"
                              ? "bg-primary"
                              : "bg-secondary"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              navigate(`/doctor/consultation/${appt.apptId}`, {
                                state: { appt },
                              })
                            }
                          >
                            Consult →
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => setCancellingAppt(appt)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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

export default DoctorHome;
