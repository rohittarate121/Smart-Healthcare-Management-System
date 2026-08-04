import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PatientAPI.getMyPrescriptions()
      .then((res) => {
        // Handle both array and wrapped responses
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.content || [];
        setPrescriptions(data);
      })
      .catch((err) => {
        console.error("Failed to load prescriptions");
        setPrescriptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading prescriptions...</p>;

  return (
    <div>
      <h4 className="fw-bold mb-4">💊 My Prescriptions</h4>
      {prescriptions.length === 0 ? (
        <div
          className="card border-0 shadow-sm
          p-5 text-center"
        >
          <p className="text-muted">No prescriptions yet.</p>
        </div>
      ) : (
        prescriptions.map((rx) => (
          <div
            key={rx.prescriptionId}
            className="card border-0 shadow-sm p-3 mb-3"
          >
            <div
              className="d-flex
              justify-content-between mb-2"
            >
              <div>
                <h6 className="fw-bold mb-0">Dr. {rx.doctor?.user?.name}</h6>
                <small className="text-muted">
                  {rx.issuedAt?.split("T")[0]}
                </small>
              </div>
              {rx.followUpDate && (
                <span className="badge bg-info">
                  Follow up: {rx.followUpDate}
                </span>
              )}
            </div>
            {rx.diagnosis && (
              <p className="small mb-2">
                <strong>Diagnosis:</strong> {rx.diagnosis}
              </p>
            )}
            {rx.items && rx.items.length > 0 && (
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {rx.items.map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        {item.medicineName}
                        {item.isAllergyFlagged && (
                          <span
                            className="badge
                            bg-danger ms-1"
                          >
                            ⚠️ Allergy
                          </span>
                        )}
                      </td>
                      <td>{item.dosage}</td>
                      <td>{item.frequency}</td>
                      <td>{item.durationDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyPrescriptions;
