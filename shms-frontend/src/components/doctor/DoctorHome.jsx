import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DoctorAPI from "../../api/doctorAPI";

const DoctorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await DoctorAPI.getMySchedule();
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  // Filter today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(
    (a)=> a.slot?.slotDate === today && a.status !== "CANCELLED",
  );

  // Stats
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const checkedIn = appointments.filter(
    (a) => a.status === "CHECKED_IN",
  ).length;

  return (
    <div>
      <h4 className="fw-bold mb-1">Welcome, {user?.name} 👨‍⚕️</h4>
      <p className="text-muted mb-4">Here is your dashboard overview</p>

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
            <div
              className="card border-0 shadow-sm
                text-center p-3"
            >
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
        <div
          className="card-header bg-white
          fw-bold border-0 pt-3"
        >
          📋 Today's Patient Queue
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div
                className="spinner-border
                spinner-border-sm text-primary"
              />
            </div>
          ) : todayAppts.length === 0 ? (
            <p className="text-muted text-center py-3">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Triage</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.map((appt) => (
                    <tr key={appt.apptId}>
                      <td>{appt.slot?.startTime}</td>
                      <td>
                        <strong>{appt.patient?.user?.name}</strong>
                        <br />
                        <small className="text-muted">
                          {appt.patient?.registrationNumber}
                        </small>
                      </td>
                      <td>
                        <span
                          className="badge
                          bg-primary"
                        >
                          {appt.apptType}
                        </span>
                      </td>
                      <td>
                        {appt.triageReport ? (
                          <span
                            className={`badge ${
                              appt.triageReport.urgencyLevel === "CRITICAL"
                                ? "bg-danger"
                                : appt.triageReport.urgencyLevel === "HIGH"
                                  ? "bg-warning text-dark"
                                  : "bg-info"
                            }`}
                          >
                            {appt.triageReport.urgencyLevel}
                          </span>
                        ) : (
                          <span
                            className="text-muted
                            small"
                          >
                            No triage
                          </span>
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
                        <button
                          className="btn btn-primary
                            btn-sm"
                          onClick={() =>
                            navigate(`/doctor/consultation/${appt.apptId}`, {
                              state: { appt },
                            })
                          }
                        >
                          Consult →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
