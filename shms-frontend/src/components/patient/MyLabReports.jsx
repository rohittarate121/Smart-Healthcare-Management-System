import React, { useState, useEffect } from "react";
import PatientAPI from "../../api/patientAPI";

const MyLabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PatientAPI.getMyLabReports()
      .then((res) => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = {
    PENDING: "warning",
    UPLOADED: "success",
    REVIEWED: "primary",
  };

  if (loading) return <p>Loading lab reports...</p>;

  return (
    <div>
      <h4 className="fw-bold mb-4">🔬 My Lab Reports</h4>
      {reports.length === 0 ? (
        <div
          className="card border-0 shadow-sm
          p-5 text-center"
        >
          <p className="text-muted">No lab reports yet.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div
            key={report.labReportId}
            className="card border-0 shadow-sm p-3 mb-3"
          >
            <div
              className="d-flex
              justify-content-between"
            >
              <div>
                <h6 className="fw-bold mb-1">{report.testName}</h6>
                <p className="text-muted small mb-1">Source: {report.source}</p>
                <p className="small mb-0">{report.uploadDate?.split("T")[0]}</p>
              </div>
              <div className="text-end">
                <span className={`badge bg-${statusColor[report.status]} mb-2`}>
                  {report.status}
                </span>
                {report.reportFileUrl && (
                  <div>
                    <a
                      href={report.reportFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm me-2"
                    >
                      📄 View PDF
                    </a>
                  </div>
                )}
                {!report.reportFileUrl && (
                  <span className="badge bg-warning text-dark">
                    Awaiting Upload
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyLabReports;
