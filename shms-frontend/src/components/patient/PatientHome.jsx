import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PatientAPI from "../../api/patientAPI";

const PatientHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await PatientAPI.getMyAppointments();
      // Show only upcoming — last 3
      setAppointments(res.data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "AI Symptom Check",
      icon: "🤖",
      path: "/patient/symptoms",
      color: "#0d6efd",
      desc: "Check your symptoms with AI",
    },
    {
      label: "Book Appointment",
      icon: "📅",
      path: "/patient/book",
      color: "#198754",
      desc: "Schedule with a doctor",
    },
    {
      label: "My Prescriptions",
      icon: "💊",
      path: "/patient/prescriptions",
      color: "#6f42c1",
      desc: "View medicines prescribed",
    },
    {
      label: "Lab Reports",
      icon: "🔬",
      path: "/patient/lab-reports",
      color: "#fd7e14",
      desc: "View your test results",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <h4 className="fw-bold mb-1">Welcome back, {user?.name} 👋</h4>
      <p className="text-muted mb-4">What would you like to do today?</p>

      {/* Quick Action Cards */}
      <div className="row g-3 mb-4">
        {quickActions.map((action) => (
          <div key={action.path} className="col-md-3 col-sm-6">
            <div
              className="card h-100 border-0 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(action.path)}
            >
              <div className="card-body text-center py-4">
                <div
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "8px",
                  }}
                >
                  {action.icon}
                </div>
                <h6 className="fw-bold mb-1">{action.label}</h6>
                <p className="text-muted small mb-0">{action.desc}</p>
              </div>
              <div
                style={{
                  height: "4px",
                  backgroundColor: action.color,
                  borderRadius: "0 0 8px 8px",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card border-0 shadow-sm">
        <div
          className="card-header bg-white
          fw-bold border-0 pt-3"
        >
          Recent Appointments
        </div>
        <div className="card-body">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-muted">No appointments yet.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/patient/symptoms")}
              >
                Start with AI Symptom Check
              </button>
            </div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.apptId}>
                    <td>{appt.doctor?.user?.name || "N/A"}</td>
                    <td>{appt.slot?.slotDate || "N/A"}</td>
                    <td>{appt.slot?.startTime || "N/A"}</td>
                    <td>
                      <span
                        className={`badge ${
                          appt.status === "CONFIRMED"
                            ? "bg-success"
                            : appt.status === "CANCELLED"
                              ? "bg-danger"
                              : appt.status === "COMPLETED"
                                ? "bg-secondary"
                                : "bg-warning text-dark"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
