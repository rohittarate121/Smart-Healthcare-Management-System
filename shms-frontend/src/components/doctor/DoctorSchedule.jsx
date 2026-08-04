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

  useEffect(() => {
    DoctorAPI.getMySchedule()
      .then((res) => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div>
      <h4 className="fw-bold mb-4">📅 My Schedule</h4>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        {["ALL", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map(
          (s) => (
            <button
              key={s}
              className={`btn btn-sm ${
                filter === s ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ),
        )}
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
          <p className="text-muted">No appointments found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((appt) => (
            <div key={appt.apptId} className="col-12">
              <div
                className="card border-0
                shadow-sm p-3"
              >
                <div
                  className="d-flex
                  justify-content-between
                  align-items-center"
                >
                  <div>
                    <h6 className="fw-bold mb-1">{appt.patient?.user?.name}</h6>
                    <p className="text-muted small mb-1">
                      {appt.patient?.registrationNumber}
                    </p>
                    <p className="small mb-0">
                      📅 {appt.slot?.slotDate} at {appt.slot?.startTime}
                    </p>
                    {appt.diagnosis && (
                      <p
                        className="small
                        text-success mb-0"
                      >
                        Dx: {appt.diagnosis}
                      </p>
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
                    {(appt.status === "CONFIRMED" ||
                      appt.status === "CHECKED_IN" ||
                      appt.status === "IN_PROGRESS") && (
                      <button
                        className="btn btn-primary
                          btn-sm"
                        onClick={() =>
                          navigate(`/doctor/consultation/${appt.apptId}`, {
                            state: { appt },
                          })
                        }
                      >
                        Open Consultation
                      </button>
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

export default DoctorSchedule;
