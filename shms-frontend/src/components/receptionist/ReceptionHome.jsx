import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ReceptionAPI from "../../api/receptionAPI";

const ReceptionHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await ReceptionAPI.getAllAppointments();
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const todayAppts = appointments.filter((a) => a.slot?.slotDate === today);

  const confirmed = todayAppts.filter((a) => a.status === "CONFIRMED").length;

  const checkedIn = todayAppts.filter((a) => a.status === "CHECKED_IN").length;

  const completed = todayAppts.filter((a) => a.status === "COMPLETED").length;

  return (
    <div>
      <h4 className="fw-bold mb-1">Welcome, {user?.name} 🏥</h4>
      <p className="text-muted mb-4">
        Receptionist Dashboard —{" "}
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Today's Appointments",
            value: todayAppts.length,
            color: "#0d6efd",
            bg: "#e7f1ff",
            icon: "📅",
          },
          {
            label: "Confirmed",
            value: confirmed,
            color: "#198754",
            bg: "#e8f5e9",
            icon: "✅",
          },
          {
            label: "Checked In",
            value: checkedIn,
            color: "#fd7e14",
            bg: "#fff3e0",
            icon: "🏥",
          },
          {
            label: "Completed",
            value: completed,
            color: "#6f42c1",
            bg: "#f3e5f5",
            icon: "🏁",
          },
        ].map((s) => (
          <div key={s.label} className="col-md-3">
            <div
              className="card border-0 shadow-sm p-3"
              style={{ backgroundColor: s.bg }}
            >
              <div
                className="d-flex
                justify-content-between
                align-items-center"
              >
                <div>
                  <p className="text-muted small mb-1">{s.label}</p>
                  <h4 className="fw-bold mb-0" style={{ color: s.color }}>
                    {s.value}
                  </h4>
                </div>
                <span style={{ fontSize: "2rem" }}>{s.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div
            className="card border-0 shadow-sm p-4
              text-center h-100"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/receptionist/book")}
          >
            <div style={{ fontSize: "2.5rem" }}>📅</div>
            <h6 className="fw-bold mb-1">Book Appointment</h6>
            <p className="text-muted small mb-0">Book for walk-in patients</p>
          </div>
        </div>
        <div className="col-md-6">
          <div
            className="card border-0 shadow-sm p-4
              text-center h-100"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/receptionist/checkin")}
          >
            <div style={{ fontSize: "2.5rem" }}>✅</div>
            <h6 className="fw-bold mb-1">Patient Check-in</h6>
            <p className="text-muted small mb-0">Mark patient as arrived</p>
          </div>
        </div>
      </div>

      {/* Today's Appointment List */}
      <div className="card border-0 shadow-sm">
        <div
          className="card-header bg-white
          fw-bold border-0 pt-3"
        >
          📋 Today's Appointment Queue
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
              No appointments for today.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Type</th>
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
                      </td>
                      <td>Dr. {appt.doctor?.user?.name}</td>
                      <td>
                        <span
                          className="badge
                          bg-primary"
                        >
                          {appt.apptType}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            appt.status === "CONFIRMED"
                              ? "bg-success"
                              : appt.status === "CHECKED_IN"
                                ? "bg-warning text-dark"
                                : appt.status === "COMPLETED"
                                  ? "bg-secondary"
                                  : "bg-info"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        {appt.status === "CONFIRMED" && (
                          <button
                            className="btn
                              btn-outline-success
                              btn-sm"
                            onClick={() =>
                              navigate("/receptionist/checkin", {
                                state: { appt },
                              })
                            }
                          >
                            Check In
                          </button>
                        )}
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

export default ReceptionHome;
