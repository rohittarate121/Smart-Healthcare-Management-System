import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LabAPI from "../../api/labAPI";

const UploadReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-filled if navigated from pending order
  const preselected = location.state?.report;

  const [pending, setPending] = useState([]);
  const [selectedReport, setSelectedReport] = useState(preselected || null);
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await LabAPI.getPendingOrders();
      setPending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch pending orders");
    } finally {
      setFetching(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedReport) {
      setError("Select a lab order first.");
      return;
    }
    if (!fileUrl.trim()) {
      setError("Enter the report file URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await LabAPI.uploadReport(selectedReport.labReportId, fileUrl, notes);

      setSuccess(
        `Report for "${selectedReport.testName}" uploaded successfully. Patient will be notified.`,
      );

      // Clear form
      setSelectedReport(null);
      setFileUrl("");
      setNotes("");

      // Refresh pending list
      fetchPending();

      setTimeout(() => {
        setSuccess("");
        navigate("/labtech");
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="d-flex
        justify-content-between mb-4"
      >
        <h4 className="fw-bold">📤 Upload Lab Report</h4>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/labtech")}
        >
          ← Back
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}

      <div className="row g-4">
        {/* Left — Select Order */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="fw-bold mb-3">Select Pending Order</h6>
            {fetching ? (
              <div className="text-center py-3">
                <div
                  className="spinner-border
                  spinner-border-sm text-primary"
                />
              </div>
            ) : pending.length === 0 ? (
              <p className="text-muted small">No pending orders.</p>
            ) : (
              pending.map((report) => (
                <div
                  key={report.labReportId}
                  className={`p-2 mb-2 rounded border
                    ${
                      selectedReport?.labReportId === report.labReportId
                        ? "border-primary bg-light"
                        : ""
                    }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedReport(report)}
                >
                  <p className="fw-bold small mb-0">{report.testName}</p>
                  <p className="text-muted small mb-0">
                    {report.patient?.user?.name} | Order #{report.labReportId}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Upload Form */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">Upload Result</h6>

            {selectedReport ? (
              <div
                className="p-2 mb-3 rounded"
                style={{ backgroundColor: "#e8f4fd" }}
              >
                <p className="small mb-0 fw-bold">
                  Selected: {selectedReport.testName}
                </p>
                <p className="small mb-0 text-muted">
                  Patient: {selectedReport.patient?.user?.name}
                </p>
              </div>
            ) : (
              <div className="alert alert-info py-2">
                Select a pending order on the left
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Report File URL</label>
              <input
                type="url"
                className="form-control"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://storage.shms.com/reports/..."
              />
              <small className="text-muted">
                Enter the URL where the report file is stored. In production
                this will be an S3 or file server URL.
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label">Notes / Findings</label>
              <textarea
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes or key findings..."
              />
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={handleUpload}
              disabled={loading || !selectedReport || !fileUrl.trim()}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border
                    spinner-border-sm me-2"
                  />
                  Uploading...
                </>
              ) : (
                "📤 Upload & Notify Patient"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
