import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";

const statusColor = {
  CONFIRMED: "success",
  PENDING: "warning",
  COMPLETED: "secondary",
  CANCELLED: "danger",
  CHECKED_IN: "info",
  IN_PROGRESS: "primary",
  NO_SHOW: "dark",
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await PatientAPI.getMyAppointments();
      setAppointments(res.data);
    } catch (err) {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;

    try {
      await PatientAPI.cancelAppointment(apptId, "Cancelled by patient");
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed.");
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
      <h4 className="fw-bold mb-4">📅 My Appointments</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {appointments.length === 0 ? (
        <div
          className="card border-0 shadow-sm p-5
          text-center"
        >
          <p className="text-muted">No appointments yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {appointments.map((appt) => (
            <div key={appt.apptId} className="col-12">
              <div className="card border-0 shadow-sm p-3">
                <div
                  className="d-flex
                  justify-content-between
                  align-items-start"
                >
                  <div>
                    <h6 className="fw-bold mb-1">
                      Dr. {appt.doctor?.user?.name}
                    </h6>
                    <p className="text-muted small mb-1">
                      {appt.doctor?.specialization}
                    </p>
                    <p className="small mb-1">
                      📅 {appt.slot?.slotDate} at {appt.slot?.startTime}
                    </p>
                    {appt.diagnosis && (
                      <p
                        className="small mb-0
                        text-success"
                      >
                        Diagnosis: {appt.diagnosis}
                      </p>
                    )}
                  </div>
                  <div className="text-end">
                    <span
                      className={`badge bg-${
                        statusColor[appt.status] || "secondary"
                      } mb-2`}
                    >
                      {appt.status}
                    </span>
                    {appt.status === "CONFIRMED" && (
                      <div>
                        <button
                          className="btn btn-outline-danger
                            btn-sm"
                          onClick={() => handleCancel(appt.apptId)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
