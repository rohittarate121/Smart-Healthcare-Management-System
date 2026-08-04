import React, { useState, useEffect } from "react";
import BillingAPI from "../../api/billingAPI";

const InvoiceViewerModal = ({ invoiceId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await BillingAPI.getInvoiceDetails(invoiceId);
        setInvoice(res.data);
      } catch (err) {
        setError("Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handleDownloadPdf = async () => {
    try {
      const response = await BillingAPI.getInvoicePdfBlob(invoiceId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${invoice?.invoiceNumber || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download PDF invoice.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoiceId) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          {/* Action Bar / Header */}
          <div className="modal-header bg-dark text-white d-print-none">
            <h5 className="modal-title fw-bold">🧾 Invoice Preview #{invoice?.invoiceNumber}</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={handlePrint}>
                🖨️ Print Invoice
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleDownloadPdf}>
                📥 Download PDF
              </button>
              <button type="button" className="btn-close btn-close-white ms-2" onClick={onClose}></button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="modal-body p-5 bg-white text-dark" id="printable-invoice">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-muted">Loading Invoice...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : invoice ? (
              <div>
                {/* Hospital Header Banner */}
                <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                  <div>
                    <h2 className="fw-bold text-primary mb-1">SMART HEALTHCARE SYSTEM</h2>
                    <p className="text-muted small mb-1">123 Healthcare Blvd, Medical District, Pune, MH</p>
                    <p className="text-muted small mb-1">Phone: +91 (020) 555-0199 | Email: billing@shms-hospital.org</p>
                    <p className="text-muted small mb-0">GSTIN: 27AAAAA0000A1Z5</p>
                  </div>
                  <div className="text-end">
                    <h3 className="fw-bold text-secondary mb-1">INVOICE</h3>
                    <h6 className="fw-bold text-dark mb-1">#{invoice.invoiceNumber}</h6>
                    <p className="small text-muted mb-1">
                      Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString() : "N/A"}
                    </p>
                    <span
                      className={`badge fs-6 ${
                        invoice.paymentStatus === "PAID"
                          ? "bg-success"
                          : invoice.paymentStatus === "PARTIAL"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {invoice.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Patient & Admission Details Box */}
                <div className="card border mb-4 bg-light">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <small className="text-muted d-block">PATIENT NAME</small>
                        <strong className="text-dark fs-6">{invoice.patientName}</strong>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">PATIENT ID / NO.</small>
                        <strong className="text-dark fs-6">{invoice.registrationNumber}</strong>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">ATTENDING DOCTOR</small>
                        <strong className="text-dark fs-6">{invoice.doctorName}</strong>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">DEPARTMENT</small>
                        <strong className="text-dark fs-6">{invoice.departmentName || "General"}</strong>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">BED / WARD</small>
                        <span className="text-dark">{invoice.bedNumber} ({invoice.wardName})</span>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">ADMISSION DATE</small>
                        <span className="text-dark">
                          {invoice.admissionDate ? new Date(invoice.admissionDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">DISCHARGE DATE</small>
                        <span className="text-dark">
                          {invoice.dischargeDate ? new Date(invoice.dischargeDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">PAYMENT METHOD</small>
                        <span className="text-dark">{invoice.paymentMethod || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized Charges Table */}
                <h5 className="fw-bold mb-3">Itemized Hospital Charges</h5>
                <div className="table-responsive mb-4">
                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "55%" }}>Description / Charge Item</th>
                        <th style={{ width: "15%" }} className="text-end">Unit Price</th>
                        <th style={{ width: "10%" }} className="text-center">Qty</th>
                        <th style={{ width: "15%" }} className="text-end">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, idx) => (
                          <tr key={item.itemId || idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <div className="fw-semibold">{item.description}</div>
                              <small className="text-muted">{item.category}</small>
                            </td>
                            <td className="text-end">₹ {item.unitPrice?.toFixed(2)}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end fw-bold">₹ {item.totalPrice?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No itemized charges listed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals Summary */}
                <div className="row justify-content-end mb-4">
                  <div className="col-md-5">
                    <div className="card border">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Subtotal:</span>
                          <span className="fw-semibold">₹ {invoice.subtotal?.toFixed(2)}</span>
                        </div>
                        {invoice.discountAmount > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-danger">
                            <span>Discount ({invoice.discountPercentage || 0}%):</span>
                            <span>- ₹ {invoice.discountAmount?.toFixed(2)}</span>
                          </div>
                        )}
                        {invoice.gstAmount > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>GST Tax ({invoice.gstPercentage}%):</span>
                            <span>+ ₹ {invoice.gstAmount?.toFixed(2)}</span>
                          </div>
                        )}
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fs-5 fw-bold text-dark mb-2">
                          <span>Grand Total:</span>
                          <span>₹ {invoice.grandTotal?.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-success mb-1">
                          <span>Paid Amount:</span>
                          <span className="fw-bold">₹ {invoice.paidAmount?.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-danger fw-bold">
                          <span>Due Amount:</span>
                          <span>₹ {invoice.dueAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures Footer */}
                <div className="row pt-5 mt-4 border-top">
                  <div className="col-6">
                    <p className="text-muted small mb-4">Patient / Relative Signature</p>
                    <p className="text-muted">_____________________________</p>
                  </div>
                  <div className="col-6 text-end">
                    <p className="fw-bold text-dark mb-4">Authorized Billing Signatory</p>
                    <p className="text-muted">_____________________________</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="modal-footer bg-light d-print-none">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewerModal;
