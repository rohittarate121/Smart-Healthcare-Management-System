import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LabAPI from "../../api/labAPI";
import API from "../../api/axiosConfig";

const LabTechHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [allReports, setAllReports] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await LabAPI.getPendingOrders();
      const data = Array.isArray(res.data) ? res.data : [];
      setPending(data);

      // Also fetch all reports for stats
      const allRes = await API.get("/api/lab-reports/all");
      setAllReports(Array.isArray(allRes.data) ? allRes.data : []);
    } catch (err) {
      console.error("Failed to load lab data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-1">Welcome, {user?.name} 🔬</h4>
      <p className="text-muted mb-4">Lab Technician Dashboard</p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm
              text-center p-3"
            style={{ backgroundColor: "#fff3e0" }}
          >
            <div style={{ fontSize: "2rem" }}>⏳</div>
            <h3 className="fw-bold mb-0" style={{ color: "#fd7e14" }}>
              {pending.length}
            </h3>
            <p className="text-muted small mb-0">Pending Orders</p>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm
      text-center p-3"
            style={{ backgroundColor: "#e8f5e9" }}
          >
            <div style={{ fontSize: "2rem" }}>✅</div>
            <h3 className="fw-bold mb-0" style={{ color: "#198754" }}>
              {allReports.filter((r) => r.status === "UPLOADED").length}
            </h3>
            <p className="text-muted small mb-0">Uploaded Reports</p>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm
              text-center p-3 h-100
              d-flex flex-column
              justify-content-center
              align-items-center"
            style={{
              cursor: "pointer",
              backgroundColor: "#e7f1ff",
            }}
            onClick={() => navigate("/labtech/upload")}
          >
            <div style={{ fontSize: "2rem" }}>📤</div>
            <p className="fw-bold mb-0" style={{ color: "#0d6efd" }}>
              Upload Report
            </p>
          </div>
        </div>
      </div>

      {/* Pending Orders Table */}
      <div className="card border-0 shadow-sm">
        <div
          className="card-header bg-white
          fw-bold border-0 pt-3 d-flex
          justify-content-between"
        >
          <span>⏳ Pending Lab Orders</span>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={fetchPending}
          >
            Refresh
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div
                className="spinner-border
                spinner-border-sm text-primary"
              />
            </div>
          ) : pending.length === 0 ? (
            <p className="text-muted text-center py-3">
              No pending lab orders. ✅
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Patient</th>
                    <th>Ordered By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((report) => (
                    <tr key={report.labReportId}>
                      <td>
                        <strong>{report.testName}</strong>
                      </td>
                      <td>{report.patient?.user?.name}</td>
                      <td>Dr. {report.orderedBy?.user?.name || "N/A"}</td>
                      <td className="small text-muted">
                        {report.uploadDate?.split("T")[0]}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            report.status === "PENDING"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary
                            btn-sm"
                          onClick={() =>
                            navigate("/labtech/upload", {
                              state: { report },
                            })
                          }
                        >
                          Upload Result
                        </button>
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

export default LabTechHome;
