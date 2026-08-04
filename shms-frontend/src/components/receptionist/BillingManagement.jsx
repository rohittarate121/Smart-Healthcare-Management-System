import React, { useState, useEffect } from "react";
import BillingAPI from "../../api/billingAPI";
import LiveBillModal from "./LiveBillModal";
import AddChargeModal from "./AddChargeModal";
import DischargeBillingModal from "./DischargeBillingModal";
import InvoiceViewerModal from "./InvoiceViewerModal";

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState("admissions"); // 'admissions' | 'invoices'
  const [admissions, setAdmissions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals state
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'live' | 'addCharge' | 'discharge' | 'invoice'

  const fetchActiveAdmissions = async () => {
    try {
      setLoading(true);
      const res = await BillingAPI.getActiveAdmissions();
      setAdmissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to fetch active admissions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async (query = "") => {
    try {
      setLoading(true);
      const res = await BillingAPI.searchInvoices(query);
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to fetch invoice records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admissions") {
      fetchActiveAdmissions();
    } else {
      fetchInvoices(searchQuery);
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvoices(searchQuery);
  };

  const openLiveBill = (admId) => {
    setSelectedAdmissionId(admId);
    setActiveModal("live");
  };

  const openAddCharge = (admId) => {
    setSelectedAdmissionId(admId);
    setActiveModal("addCharge");
  };

  const openDischarge = (admId) => {
    setSelectedAdmissionId(admId);
    setActiveModal("discharge");
  };

  const openInvoiceViewer = (invId) => {
    setSelectedInvoiceId(invId);
    setActiveModal("invoice");
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">💳 Hospital Billing & Invoice Lifecycle</h4>
          <p className="text-muted small mb-0">Manage live patient bills, add charges, generate discharge invoices, and process payments</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "admissions" ? "active text-primary" : "text-secondary"}`}
            onClick={() => setActiveTab("admissions")}
          >
            🏥 Active Inpatients ({admissions.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "invoices" ? "active text-primary" : "text-secondary"}`}
            onClick={() => setActiveTab("invoices")}
          >
            🧾 Invoice Archive & Search
          </button>
        </li>
      </ul>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tab 1: Active Inpatients */}
      {activeTab === "admissions" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-bold py-3">Active Inpatient Admissions</div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : admissions.length === 0 ? (
              <p className="text-muted text-center py-4">No active inpatient admissions found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Patient</th>
                      <th>Registration #</th>
                      <th>Doctor</th>
                      <th>Bed / Ward</th>
                      <th>Admission Date</th>
                      <th className="text-end">Billing Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map((adm) => (
                      <tr key={adm.admissionId}>
                        <td>
                          <div className="fw-bold">{adm.patient?.user?.name}</div>
                          <small className="text-muted">{adm.patient?.user?.phone}</small>
                        </td>
                        <td>{adm.patient?.registrationNumber}</td>
                        <td>Dr. {adm.doctor?.user?.name}</td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {adm.bed?.bedNumber} ({adm.bed?.ward?.wardName || "General"})
                          </span>
                        </td>
                        <td>{new Date(adm.admittedAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => openLiveBill(adm.admissionId)}>
                              📊 Live Bill
                            </button>
                            <button className="btn btn-outline-success" onClick={() => openAddCharge(adm.admissionId)}>
                              ➕ Add Charge
                            </button>
                            <button className="btn btn-danger" onClick={() => openDischarge(adm.admissionId)}>
                              🏥 Discharge & Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Invoice History */}
      {activeTab === "invoices" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
            <form onSubmit={handleSearchSubmit} className="row g-2">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Invoice Number, Patient Name, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary w-100">
                  🔍 Search Invoices
                </button>
              </div>
            </form>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-muted text-center py-4">No invoices found matching query.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Invoice #</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Grand Total</th>
                      <th>Paid / Due</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.invoiceId}>
                        <td className="fw-bold">{inv.invoiceNumber}</td>
                        <td>
                          <div>{inv.patientName}</div>
                          <small className="text-muted">{inv.registrationNumber}</small>
                        </td>
                        <td className="small">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                        <td className="fw-bold">₹ {inv.grandTotal?.toFixed(2)}</td>
                        <td>
                          <div className="text-success small">Paid: ₹{inv.paidAmount?.toFixed(2)}</div>
                          <div className="text-danger small">Due: ₹{inv.dueAmount?.toFixed(2)}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              inv.paymentStatus === "PAID"
                                ? "bg-success"
                                : inv.paymentStatus === "PARTIAL"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => openInvoiceViewer(inv.invoiceId)}
                          >
                            🧾 View / PDF
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
      )}

      {/* Render Active Modals */}
      {activeModal === "live" && (
        <LiveBillModal
          admissionId={selectedAdmissionId}
          onClose={() => setActiveModal(null)}
          onAddChargeClick={(admId) => openAddCharge(admId)}
          onDischargeClick={(admId) => openDischarge(admId)}
        />
      )}

      {activeModal === "addCharge" && (
        <AddChargeModal
          admissionId={selectedAdmissionId}
          onClose={() => setActiveModal(null)}
          onChargeAdded={() => {
            if (activeTab === "admissions") fetchActiveAdmissions();
          }}
        />
      )}

      {activeModal === "discharge" && (
        <DischargeBillingModal
          admissionId={selectedAdmissionId}
          onClose={() => setActiveModal(null)}
          onInvoiceGenerated={(invData) => {
            fetchActiveAdmissions();
            if (invData?.invoiceId) {
              openInvoiceViewer(invData.invoiceId);
            }
          }}
        />
      )}

      {activeModal === "invoice" && (
        <InvoiceViewerModal invoiceId={selectedInvoiceId} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default BillingManagement;
