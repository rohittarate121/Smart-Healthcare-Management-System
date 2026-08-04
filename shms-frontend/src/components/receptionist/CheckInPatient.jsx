import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReceptionAPI from "../../api/receptionAPI";

const CheckInPatient = () => {
  const location = useLocation();
  const preselected = location.state?.appt;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await ReceptionAPI.getAllAppointments();
      const all = Array.isArray(res.data) ? res.data : [];

      // Only show confirmed appointments
      const confirmed = all.filter((a) => a.status === "CONFIRMED");
      setAppointments(confirmed);
    } catch (err) {
      console.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (apptId) => {
    setCheckingIn(apptId);
    setError("");
    try {
      await ReceptionAPI.checkInPatient(apptId);
      setSuccess(`Patient checked in successfully for appointment #${apptId}`);
      fetchAppointments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed.");
    } finally {
      setCheckingIn(null);
    }
  };

  const filtered = appointments.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.patient?.user?.name?.toLowerCase().includes(q) ||
      a.doctor?.user?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h4 className="fw-bold mb-4">✅ Patient Check-in</h4>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by patient or doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
          <p className="text-muted">
            No confirmed appointments waiting for check-in.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((appt) => (
            <div key={appt.apptId} className="col-12">
              <div
                className={`card border-0 shadow-sm
                  p-3 ${
                    preselected?.apptId === appt.apptId
                      ? "border-primary border-2"
                      : ""
                  }`}
              >
                <div
                  className="d-flex
                  justify-content-between
                  align-items-center"
                >
                  <div>
                    <h6 className="fw-bold mb-1">{appt.patient?.user?.name}</h6>
                    <p
                      className="text-muted
                      small mb-1"
                    >
                      {appt.patient?.registrationNumber}
                    </p>
                    <p className="small mb-1">
                      Doctor: Dr. {appt.doctor?.user?.name} |{" "}
                      {appt.doctor?.specialization}
                    </p>
                    <p className="small mb-0">
                      📅 {appt.slot?.slotDate} at {appt.slot?.startTime}
                    </p>
                  </div>
                  <div className="text-end">
                    <span
                      className="badge
                      bg-success mb-2 d-block"
                    >
                      {appt.status}
                    </span>
                    <button
                      className="btn btn-success"
                      onClick={() => handleCheckIn(appt.apptId)}
                      disabled={checkingIn === appt.apptId}
                    >
                      {checkingIn === appt.apptId
                        ? "Checking in..."
                        : "✅ Check In"}
                    </button>
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

export default CheckInPatient;
