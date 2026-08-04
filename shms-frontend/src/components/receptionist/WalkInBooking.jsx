import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionAPI from "../../api/receptionAPI";

const SPECIALTIES = [
  "Cardiologist",
  "Neurologist",
  "Dermatologist",
  "Gastroenterologist",
  "Orthopedist",
  "ENT Specialist",
  "Pulmonologist",
  "General Physician",
];

const WalkInBooking = () => {
  const navigate = useNavigate();

  // Step tracking
  // 1 = patient lookup
  // 2 = doctor + slot
  // 3 = confirm
  const [step, setStep] = useState(1);

  // Patient state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // New patient registration form
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    password: "Walkin@123", // default password
  });

  // Doctor + slot state
  const [specialty, setSpecialty] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Patient Search ──────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError("");
    setSearchResults([]);
    try {
      const res = await ReceptionAPI.searchPatients(searchQuery);
      const results = Array.isArray(res.data) ? res.data : [];
      setSearchResults(results);
      if (results.length === 0) {
        setError("No patient found with that name, " + "phone or email.");
      }
    } catch (err) {
      setError("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Register new walk-in patient ──────────────────────────────────
  const handleRegisterWalkIn = async () => {
    if (!newPatient.name || !newPatient.email || !newPatient.phone) {
      setError("Name, email and phone are required.");
      return;
    }
    if (newPatient.phone.length !== 10) {
      setError("Phone must be 10 digits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ReceptionAPI.registerWalkIn(newPatient);
      if (res.data.success) {
        setSelectedPatient({
          userId: res.data.userId,
          name: res.data.name,
          email: newPatient.email,
          phone: newPatient.phone,
        });
        setShowRegisterForm(false);
        setStep(2);
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch doctors by specialty ────────────────────────────────────
  const handleFetchDoctors = async () => {
    if (!specialty) return;
    setLoading(true);
    setDoctors([]);
    setSelectedDoctor(null);
    setSlots([]);
    setSelectedSlot(null);
    setError("");
    try {
      const res = await ReceptionAPI.getDoctorsBySpecialty(specialty);
      const docs = Array.isArray(res.data) ? res.data : [];
      setDoctors(docs);
      if (docs.length === 0) {
        setError("No doctors available for " + specialty + ".");
      }
    } catch (err) {
      setError("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch slots ───────────────────────────────────────────────────
  const handleFetchSlots = async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    setError("");
    try {
      const res = await ReceptionAPI.getDoctorSlots(
        selectedDoctor.doctorId,
        selectedDate || null,
      );
      const availSlots = Array.isArray(res.data) ? res.data : [];
      setSlots(availSlots);
      if (availSlots.length === 0) {
        setError("No available slots. " + "Try a different date.");
      }
    } catch (err) {
      setError("Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm booking ───────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!selectedPatient || !selectedSlot) {
      setError("Missing patient or slot.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await ReceptionAPI.bookAppointment({
        doctorId: selectedDoctor.doctorId,
        availId: selectedSlot.availId,
        apptType: "OPD",
      });
      setSuccess(
        `✅ Appointment booked for ` +
          `${selectedPatient.name} with ` +
          `Dr. ${selectedDoctor.user?.name} ` +
          `on ${selectedSlot.slotDate} ` +
          `at ${selectedSlot.startTime}`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAllPatients = async () => {
    setSearching(true);
    setError("");
    try {
      const res = await ReceptionAPI.searchPatients("");
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load patients.");
    } finally {
      setSearching(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div>
      <div
        className="d-flex
        justify-content-between mb-4"
      >
        <h4 className="fw-bold">📅 Walk-in Appointment Booking</h4>
        <button
          className="btn btn-outline-secondary
            btn-sm"
          onClick={() => navigate("/receptionist")}
        >
          ← Back
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="alert alert-success">
          {success}
          <div className="mt-2">
            <button
              className="btn btn-outline-success
                btn-sm me-2"
              onClick={() => {
                setSuccess("");
                setStep(1);
                setSelectedPatient(null);
                setSelectedDoctor(null);
                setSelectedSlot(null);
                setSlots([]);
                setDoctors([]);
                setSpecialty("");
              }}
            >
              Book Another
            </button>
            <button
              className="btn btn-outline-primary
                btn-sm"
              onClick={() => navigate("/receptionist")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger py-2">❌ {error}</div>}

      {!success && (
        <>
          {/* ── STEP 1: Patient ── */}
          <div
            className="card border-0 shadow-sm
            p-4 mb-3"
          >
            <div
              className="d-flex
              justify-content-between mb-3"
            >
              <h6 className="fw-bold mb-0">Step 1: Find or Register Patient</h6>
              {selectedPatient && (
                <span className="badge bg-success">✓ Patient Selected</span>
              )}
            </div>

            {selectedPatient ? (
              /* Selected patient card */
              <div
                className="d-flex
                justify-content-between
                align-items-center p-3 rounded"
                style={{
                  backgroundColor: "#e8f5e9",
                }}
              >
                <div>
                  <p className="fw-bold mb-0">{selectedPatient.name}</p>
                  <p
                    className="text-muted
                    small mb-0"
                  >
                    📧 {selectedPatient.email} | 📱 {selectedPatient.phone}
                  </p>
                </div>
                <button
                  className="btn btn-outline-secondary
                    btn-sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setStep(1);
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                {/* Search bar */}
                <div className="d-flex gap-2 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchResults([]);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                  >
                    {searching ? "..." : "🔍"}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={loadAllPatients}
                    disabled={searching}
                    title="Show all patients"
                  >
                    📋 All
                  </button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div
                    className="border rounded mb-3"
                    style={{
                      maxHeight: "160px",
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.map((p) => (
                      <div
                        key={p.userId}
                        className="p-2 border-bottom"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSelectedPatient({
                            userId: p.userId,
                            name: p.name,
                            email: p.email,
                            phone: p.phone,
                          });
                          setStep(2);
                          setSearchResults([]);
                          setError("");
                        }}
                      >
                        <p
                          className="fw-bold
                          small mb-0"
                        >
                          {p.name}
                        </p>
                        <p
                          className="text-muted
                          small mb-0"
                        >
                          {p.email} | {p.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div
                  className="d-flex
                  align-items-center gap-2 mb-3"
                >
                  <hr className="flex-grow-1" />
                  <span className="text-muted small">Patient not found?</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Register button */}
                <button
                  className="btn btn-outline-primary
                    w-100"
                  onClick={() => {
                    setShowRegisterForm(!showRegisterForm);
                    setError("");
                  }}
                >
                  {showRegisterForm
                    ? "✕ Cancel Registration"
                    : "➕ Register New Walk-in Patient"}
                </button>

                {/* New patient form */}
                {showRegisterForm && (
                  <div
                    className="mt-3 p-3 rounded"
                    style={{
                      backgroundColor: "#f0f9ff",
                    }}
                  >
                    <h6 className="fw-bold mb-3">New Patient Details</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label
                          className="form-label
                          small"
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Patient full name"
                          value={newPatient.name}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label
                          small"
                        >
                          Phone (10 digits) *
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="10-digit phone"
                          value={newPatient.phone}
                          maxLength={10}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              phone: e.target.value.replace(/\D/g, ""),
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label
                          small"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Patient email"
                          value={newPatient.email}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label
                          small"
                        >
                          Temp Password
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={newPatient.password}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              password: e.target.value,
                            })
                          }
                        />
                        <small className="text-muted">
                          Patient can change later
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-success
                        mt-3"
                      onClick={handleRegisterWalkIn}
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "✅ Register & Continue"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── STEP 2: Doctor + Slot ── */}
          {step >= 2 && (
            <>
              <div
                className="card border-0
                shadow-sm p-4 mb-3"
              >
                <div
                  className="d-flex
                  justify-content-between mb-3"
                >
                  <h6 className="fw-bold mb-0">
                    Step 2: Select Specialty & Doctor
                  </h6>
                  {selectedDoctor && (
                    <span
                      className="badge
                      bg-success"
                    >
                      ✓ Doctor Selected
                    </span>
                  )}
                </div>

                {/* Specialty buttons */}
                <div
                  className="d-flex flex-wrap
                  gap-2 mb-3"
                >
                  {SPECIALTIES.map((s) => (
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
                        setSelectedSlot(null);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-outline-primary
                    btn-sm mb-3"
                  onClick={handleFetchDoctors}
                  disabled={!specialty || loading}
                >
                  {loading ? "Loading..." : "🔍 Find Doctors"}
                </button>

                {/* Doctor cards */}
                {doctors.length > 0 && (
                  <div className="row g-2">
                    {doctors.map((doc) => (
                      <div key={doc.doctorId} className="col-md-4">
                        <div
                          className={`card p-3 h-100
                            ${
                              selectedDoctor?.doctorId === doc.doctorId
                                ? "border-primary border-2 bg-light"
                                : ""
                            }`}
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setSlots([]);
                            setSelectedSlot(null);
                            setError("");
                          }}
                        >
                          <p
                            className="fw-bold
                            small mb-1"
                          >
                            Dr. {doc.user?.name}
                          </p>
                          <p
                            className="text-muted
                            small mb-1"
                          >
                            {doc.specialization}
                          </p>
                          <p
                            className="text-muted
                            small mb-1"
                          >
                            {doc.qualification}
                          </p>
                          <p
                            className="text-success
                            fw-bold small mb-0"
                          >
                            ₹{doc.consultationFee}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slot selection */}
              {selectedDoctor && (
                <div
                  className="card border-0
                  shadow-sm p-4 mb-3"
                >
                  <div
                    className="d-flex
                    justify-content-between mb-3"
                  >
                    <h6 className="fw-bold mb-0">Step 3: Select Time Slot</h6>
                    {selectedSlot && (
                      <span
                        className="badge
                        bg-success"
                      >
                        ✓ Slot Selected
                      </span>
                    )}
                  </div>

                  <div
                    className="d-flex gap-2
                    align-items-end mb-3"
                  >
                    <div>
                      <label
                        className="form-label
                        small"
                      >
                        Date (optional)
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleFetchSlots}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Get Slots"}
                    </button>
                  </div>

                  {slots.length > 0 && (
                    <div
                      className="d-flex
                      flex-wrap gap-2"
                    >
                      {slots.map((slot) => (
                        <button
                          key={slot.availId}
                          className={`btn btn-sm ${
                            selectedSlot?.availId === slot.availId
                              ? "btn-primary"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setStep(3);
                            setError("");
                          }}
                        >
                          {slot.slotDate} {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step >= 3 && selectedSlot && selectedPatient && (
            <div
              className="card border-0
              shadow-sm p-4"
            >
              <h6 className="fw-bold mb-3">Step 4: Confirm Booking</h6>

              {/* Summary */}
              <div
                className="p-3 rounded mb-3"
                style={{
                  backgroundColor: "#e8f5e9",
                }}
              >
                <div className="row">
                  <div className="col-6">
                    <p className="small text-muted mb-1">Patient</p>
                    <p className="fw-bold mb-0">{selectedPatient.name}</p>
                    <p className="text-muted small mb-0">
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="small text-muted mb-1">Doctor</p>
                    <p className="fw-bold mb-0">
                      Dr. {selectedDoctor.user?.name}
                    </p>
                    <p className="text-muted small mb-0">
                      {selectedDoctor.specialization}
                    </p>
                  </div>
                  <div className="col-6 mt-2">
                    <p className="small text-muted mb-1">Date & Time</p>
                    <p className="fw-bold mb-0">{selectedSlot.slotDate}</p>
                    <p className="text-muted small mb-0">
                      {selectedSlot.startTime}
                    </p>
                  </div>
                  <div className="col-6 mt-2">
                    <p className="small text-muted mb-1">Fee</p>
                    <p
                      className="fw-bold text-success
                      mb-0"
                    >
                      ₹{selectedDoctor.consultationFee}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-success btn-lg
                  w-100"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border
                      spinner-border-sm me-2"
                    />
                    Booking...
                  </>
                ) : (
                  "✅ Confirm Appointment"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalkInBooking;
