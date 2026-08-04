import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PatientAPI from "../../api/patientAPI";

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-filled from triage result if navigated from there
  const [specialty, setSpecialty] = useState(location.state?.specialty || "");
  const reportId = location.state?.reportId || null;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const specialties = [
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "Gastroenterologist",
    "Orthopedist",
    "ENT Specialist",
    "Pulmonologist",
    "General Physician",
  ];

  // Auto-search if came from triage
  useEffect(() => {
    if (specialty) {
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDoctors = async () => {
    if (!specialty) return;
    setLoading(true);
    setError("");
    try {
      const res = await PatientAPI.getDoctorsBySpecialty(specialty);
      setDoctors(res.data);
      if (res.data.length === 0) {
        setError("No doctors available for this specialty.");
      }
    } catch (err) {
      setError("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (doctorId) => {
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await PatientAPI.getDoctorSlots(
        doctorId,
        selectedDate || null,
      );
      setSlots(res.data);
      if (res.data.length === 0) {
        setError("No available slots. Try a different date.");
      } else {
        setError("");
      }
    } catch (err) {
      setError("Failed to load slots.");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await PatientAPI.bookAppointment({
        doctorId: selectedDoctor.doctorId,
        availId: selectedSlot.availId,
        triageReportId: reportId,
        apptType: "OPD",
      });
      setSuccess(
        "Appointment booked successfully! " +
          "Check My Appointments for details.",
      );
      setTimeout(() => navigate("/patient/appointments"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">📅 Book Appointment</h4>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Specialty Selection */}
      <div className="card border-0 shadow-sm p-4 mb-3">
        <h6 className="fw-bold mb-3">Select Specialty</h6>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {specialties.map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${
                specialty === s ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => {
                setSpecialty(s);
                setDoctors([]);
                setSelectedDoctor(null);
                setSlots([]);
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchDoctors}
          disabled={!specialty || loading}
        >
          {loading ? "Searching..." : "Search Doctors"}
        </button>
      </div>

      {/* Doctor List */}
      {doctors.length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-3">
          <h6 className="fw-bold mb-3">Available Doctors</h6>
          <div className="row g-3">
            {doctors.map((doc) => (
              <div key={doc.doctorId} className="col-md-4">
                <div
                  className={`card h-100 p-3 ${
                    selectedDoctor?.doctorId === doc.doctorId
                      ? "border-primary border-2"
                      : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setSlots([]);
                    setSelectedSlot(null);
                  }}
                >
                  <h6 className="fw-bold mb-1">{doc.user?.name}</h6>
                  <p className="text-muted small mb-1">{doc.specialization}</p>
                  <p className="small mb-1">{doc.qualification}</p>
                  <p className="fw-bold text-success mb-0">
                    ₹{doc.consultationFee}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slot Selection */}
      {selectedDoctor && (
        <div className="card border-0 shadow-sm p-4 mb-3">
          <h6 className="fw-bold mb-3">Select Date and Time Slot</h6>
          <div className="d-flex gap-3 align-items-end mb-3">
            <div>
              <label className="form-label small">Date (optional)</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={() => fetchSlots(selectedDoctor.doctorId)}
              disabled={slotsLoading}
            >
              {slotsLoading ? "Loading..." : "Get Slots"}
            </button>
          </div>

          {slots.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.availId}
                  className={`btn btn-sm ${
                    selectedSlot?.availId === slot.availId
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.slotDate} {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Button */}
      {selectedSlot && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-2">Confirm Booking</h6>
          <p className="text-muted small mb-3">
            Doctor: {selectedDoctor?.user?.name} | Date: {selectedSlot.slotDate}{" "}
            | Time: {selectedSlot.startTime}
          </p>
          <button
            className="btn btn-success"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? "Booking..." : "✅ Confirm Appointment"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
