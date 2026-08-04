import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DoctorAPI from "../../api/doctorAPI";
import PatientAPI from "../../api/patientAPI";

const PatientConsultation = () => {
  const { apptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const appt = location.state?.appt;

  const patientId = appt?.patient?.patientId;

  // Patient data
  const [allergies, setAllergies] = useState([]);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription form
  const [diagnosis, setDiagnosis] = useState(appt?.diagnosis || "");
  const [notes, setNotes] = useState(appt?.consultationNotes || "");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medicines, setMedicines] = useState([
    {
      medicineName: "",
      dosage: "",
      frequency: "",
      durationDays: "",
      instructions: "",
    },
  ]);

  // Lab test form
  const [testName, setTestName] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState("ehr");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [allergyWarnings, setAllergyWarnings] = useState([]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const [allergyRes, historyRes, rxRes, labRes] = await Promise.allSettled([ //Promise.all
        DoctorAPI.getPatientAllergies(patientId),
        DoctorAPI.getPatientMedicalHistory(patientId),
        DoctorAPI.getPatientPrescriptions(patientId),
        DoctorAPI.getPatientLabReports(patientId),
      ]);

      // Use value only if promise fulfilled
      if (allergyRes.status === "fulfilled")
        setAllergies(
          Array.isArray(allergyRes.value.data) ? allergyRes.value.data : [],
        );

      if (historyRes.status === "fulfilled")
        setHistory(
          Array.isArray(historyRes.value.data) ? historyRes.value.data : [],
        );

      if (rxRes.status === "fulfilled")
        setPrescriptions(
          Array.isArray(rxRes.value.data) ? rxRes.value.data : [],
        );

      if (labRes.status === "fulfilled")
        setLabReports(
          Array.isArray(labRes.value.data) ? labRes.value.data : [],
        );
    } catch (err) {
      console.error("Error loading patient data");
    } finally {
      setLoading(false);
    }
  };
  // Add medicine row
  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        durationDays: "",
        instructions: "",
      },
    ]);
  };

  // Remove medicine row
  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // Update medicine field
  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);

    // Live allergy check
    if (field === "medicineName" && value.length > 2) {
      const drugAllergies = allergies.filter((a) => a.isDrugAllergy);
      const warnings = [];
      drugAllergies.forEach((allergy) => {
        if (
          value.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
          allergy.allergen.toLowerCase().includes(value.toLowerCase())
        ) {
          warnings.push(
            `⚠️ ${value} may conflict with known allergy: ${allergy.allergen} (${allergy.severity})`,
          );
        }
      });
      setAllergyWarnings(warnings);
    }
  };

  // Complete appointment
  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      await DoctorAPI.completeAppointment(apptId, {
        consultationNotes: notes,
        diagnosis: diagnosis,
        followUpDate: followUpDate ? followUpDate + "T00:00:00" : null,
      });
      setSuccess("Appointment marked as completed.");
    } catch (err) {
      setError("Failed to complete appointment.");
    } finally {
      setSaving(false);
    }
  };

  // Save prescription
  const handleSavePrescription = async () => {
    const validMeds = medicines.filter((m) => m.medicineName.trim() !== "");

    if (validMeds.length === 0) {
      setError("Add at least one medicine.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await DoctorAPI.createPrescription({
        apptId: parseInt(apptId),
        diagnosis,
        advice,
        followUpDate: followUpDate || null,
        medicines: validMeds.map((m) => ({
          ...m,
          durationDays: parseInt(m.durationDays) || 1,
        })),
      });

      if (res.data.allergyWarnings && res.data.allergyWarnings.length > 0) {
        setAllergyWarnings(res.data.allergyWarnings);
        setSuccess("Prescription saved with allergy warnings!");
      } else {
        setSuccess("Prescription saved successfully.");
        setAllergyWarnings([]);
      }

      fetchPatientData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save prescription.");
    } finally {
      setSaving(false);
    }
  };

  // Order lab test
  const handleOrderTest = async () => {
    if (!testName.trim()) {
      setError("Enter a test name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await DoctorAPI.orderLabTest({
        patientId,
        apptId: parseInt(apptId),
        testName,
        source: "HOSPITAL_LAB",
      });
      setSuccess("Lab test ordered successfully.");
      setTestName("");
      fetchPatientData();
    } catch (err) {
      setError("Failed to order lab test.");
    } finally {
      setSaving(false);
    }
  };

  if (!appt) {
    return (
      <div className="alert alert-warning">
        No appointment data found.{" "}
        <button
          className="btn btn-link p-0"
          onClick={() => navigate("/doctor/schedule")}
        >
          Go back to schedule
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Patient Header */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div
          className="d-flex
          justify-content-between align-items-center"
        >
          <div>
            <h5 className="fw-bold mb-0">👤 {appt.patient?.user?.name}</h5>
            <small className="text-muted">
              {appt.patient?.registrationNumber} | Appt #{apptId} |
              {appt.slot?.slotDate} at {appt.slot?.startTime}
            </small>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary
                btn-sm"
              onClick={() => navigate("/doctor/schedule")}
            >
              ← Back
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={handleComplete}
              disabled={saving}
            >
              ✅ Complete Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Allergy Warnings */}
      {allergyWarnings.length > 0 && (
        <div className="alert alert-warning">
          <strong>Drug Allergy Warnings:</strong>
          <ul className="mb-0 mt-1">
            {allergyWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {[
          { key: "ehr", label: "📋 EHR & Allergies" },
          { key: "triage", label: "🤖 Triage Report" },
          { key: "rx", label: "💊 Write Prescription" },
          { key: "lab", label: "🔬 Order Lab Test" },
          { key: "history", label: "📁 Previous Visits" },
        ].map((tab) => (
          <li key={tab.key} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* EHR Tab */}
      {activeTab === "ehr" && (
        <div className="row g-3">
          {/* Allergies */}
          <div className="col-md-6">
            <div
              className="card border-0
              shadow-sm p-3 h-100"
            >
              <h6 className="fw-bold mb-3">⚠️ Drug Allergies</h6>
              {loading ? (
                <p className="text-muted">Loading...</p>
              ) : allergies.filter((a) => a.isDrugAllergy).length === 0 ? (
                <p className="text-muted small">No drug allergies recorded.</p>
              ) : (
                allergies
                  .filter((a) => a.isDrugAllergy)
                  .map((a) => (
                    <div
                      key={a.allergyId}
                      className="alert alert-danger
                        py-2 mb-2"
                    >
                      <strong>{a.allergen}</strong>
                      <br />
                      <small>
                        Reaction: {a.reaction} | Severity: {a.severity}
                      </small>
                    </div>
                  ))
              )}

              <h6 className="fw-bold mb-3 mt-3">Other Allergies</h6>
              {allergies
                .filter((a) => !a.isDrugAllergy)
                .map((a) => (
                  <div
                    key={a.allergyId}
                    className="alert alert-warning
                      py-2 mb-2"
                  >
                    <strong>{a.allergen}</strong>
                    <br />
                    <small>Reaction: {a.reaction}</small>
                  </div>
                ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="col-md-6">
            <div
              className="card border-0
              shadow-sm p-3 h-100"
            >
              <h6 className="fw-bold mb-3">🩺 Medical History</h6>
              {loading ? (
                <p className="text-muted">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-muted small">No medical history recorded.</p>
              ) : (
                history.map((h) => (
                  <div key={h.historyId} className="border-bottom pb-2 mb-2">
                    <strong>{h.conditionName}</strong>
                    {h.isChronic && (
                      <span
                        className="badge
                        bg-danger ms-2"
                      >
                        Chronic
                      </span>
                    )}
                    <br />
                    <small className="text-muted">
                      Diagnosed: {h.diagnosedDate || "Unknown"}
                    </small>
                    {h.notes && <p className="small mb-0">{h.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consultation Notes */}
          <div className="col-12">
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3">
                📝 Consultation Notes & Diagnosis
              </h6>
              <div className="mb-3">
                <label className="form-label small">Consultation Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter clinical findings..."
                />
              </div>
              <div className="mb-3">
                <label className="form-label small">Diagnosis</label>
                <input
                  type="text"
                  className="form-control"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                />
              </div>
              <div className="mb-3">
                <label className="form-label small">Follow-up Date</label>
                <input
                  type="date"
                  className="form-control"
                  style={{ maxWidth: "200px" }}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Triage Tab */}
      {activeTab === "triage" && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">🤖 AI Triage Report</h6>
          {appt.triageReport ? (
            <div>
              <div className="row g-3">
                <div className="col-md-4">
                  <div
                    className="text-center p-3 rounded"
                    style={{
                      backgroundColor:
                        appt.triageReport.urgencyLevel === "CRITICAL"
                          ? "#fff3f3"
                          : "#f0fff4",
                    }}
                  >
                    <h2
                      className="fw-bold"
                      style={{
                        color:
                          appt.triageReport.urgencyLevel === "CRITICAL"
                            ? "#dc3545"
                            : "#198754",
                      }}
                    >
                      {appt.triageReport.severityScore}
                      /100
                    </h2>
                    <p className="mb-0 fw-bold">
                      {appt.triageReport.urgencyLevel}
                    </p>
                  </div>
                </div>
                <div className="col-md-8">
                  <p>
                    <strong>Probable Condition:</strong>{" "}
                    {appt.triageReport.probableCondition}
                  </p>
                  <p>
                    <strong>Recommended Specialty:</strong>{" "}
                    {appt.triageReport.recommendedSpecialty}
                  </p>
                  <p className="text-muted">
                    {appt.triageReport.triageSummary}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">No triage report for this appointment.</p>
          )}
        </div>
      )}

      {/* Prescription Tab */}
      {activeTab === "rx" && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">💊 Write Prescription</h6>

          <div className="mb-3">
            <label className="form-label small">Advice to Patient</label>
            <textarea
              className="form-control"
              rows={2}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Rest well, drink fluids..."
            />
          </div>

          {/* Medicine Table */}
          <div className="table-responsive mb-3">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Medicine Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Days</th>
                  <th>Instructions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="form-control
                          form-control-sm"
                        value={med.medicineName}
                        onChange={(e) =>
                          updateMedicine(index, "medicineName", e.target.value)
                        }
                        placeholder="e.g. Paracetamol"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control
                          form-control-sm"
                        value={med.dosage}
                        onChange={(e) =>
                          updateMedicine(index, "dosage", e.target.value)
                        }
                        placeholder="500mg"
                      />
                    </td>
                    <td>
                      <select
                        className="form-select
                          form-select-sm"
                        value={med.frequency}
                        onChange={(e) =>
                          updateMedicine(index, "frequency", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option>Once daily</option>
                        <option>Twice daily</option>
                        <option>Three times daily</option>
                        <option>Four times daily</option>
                        <option>As needed</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control
                          form-control-sm"
                        value={med.durationDays}
                        onChange={(e) =>
                          updateMedicine(index, "durationDays", e.target.value)
                        }
                        placeholder="5"
                        min={1}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control
                          form-control-sm"
                        value={med.instructions}
                        onChange={(e) =>
                          updateMedicine(index, "instructions", e.target.value)
                        }
                        placeholder="After food"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger
                          btn-sm"
                        onClick={() => removeMedicine(index)}
                        disabled={medicines.length === 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary
                btn-sm"
              onClick={addMedicine}
            >
              + Add Medicine
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSavePrescription}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Prescription"}
            </button>
          </div>
        </div>
      )}

      {/* Lab Test Tab */}
      {activeTab === "lab" && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">🔬 Order Lab Test</h6>

          {/* Common tests quick select */}
          <div className="mb-3">
            <p className="small text-muted mb-2">Quick select:</p>
            <div className="d-flex flex-wrap gap-2">
              {[
                "Complete Blood Count (CBC)",
                "Blood Glucose Fasting",
                "Lipid Profile",
                "Liver Function Test",
                "Kidney Function Test",
                "Thyroid Function Test",
                "ECG",
                "Chest X-Ray",
                "Urine Routine",
              ].map((test) => (
                <button
                  key={test}
                  className="btn btn-outline-primary
                    btn-sm"
                  onClick={() => setTestName(test)}
                >
                  {test}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Test Name</label>
            <input
              type="text"
              className="form-control"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Enter test name"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleOrderTest}
            disabled={saving || !testName.trim()}
          >
            {saving ? "Ordering..." : "🔬 Order Test"}
          </button>

          {/* Existing lab reports */}
          {labReports.length > 0 && (
            <div className="mt-4">
              <h6 className="fw-bold mb-2">Existing Lab Reports</h6>
              {labReports.map((r) => (
                <div
                  key={r.labReportId}
                  className="d-flex
                    justify-content-between
                    border-bottom py-2"
                >
                  <span>{r.testName}</span>
                  <div>
                    <span
                      className={`badge me-2 ${
                        r.status === "UPLOADED"
                          ? "bg-success"
                          : r.status === "REVIEWED"
                            ? "bg-primary"
                            : "bg-warning text-dark"
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.reportFileUrl && (
                      <a
                        href={r.reportFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary
                          btn-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previous Visits Tab */}
      {activeTab === "history" && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">📁 Previous Prescriptions</h6>
          {prescriptions.length === 0 ? (
            <p className="text-muted">No previous prescriptions.</p>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx.prescriptionId} className="border rounded p-3 mb-3">
                <div
                  className="d-flex
                  justify-content-between mb-2"
                >
                  <strong>{rx.issuedAt?.split("T")[0]}</strong>
                  <span className="text-muted small">
                    Rx #{rx.prescriptionId}
                  </span>
                </div>
                {rx.diagnosis && (
                  <p className="small mb-2">Dx: {rx.diagnosis}</p>
                )}
                {rx.items?.map((item) => (
                  <div
                    key={item.itemId}
                    className="small text-muted
                      border-start ps-2 mb-1"
                  >
                    {item.medicineName} — {item.dosage}, {item.frequency},{" "}
                    {item.durationDays} days
                    {item.isAllergyFlagged && (
                      <span
                        className="badge
                        bg-danger ms-1"
                      >
                        Allergy Flag
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PatientConsultation;
