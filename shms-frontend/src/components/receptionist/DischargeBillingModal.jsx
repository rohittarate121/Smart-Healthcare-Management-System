import React, { useState, useEffect } from "react";
import BillingAPI from "../../api/billingAPI";

const DischargeBillingModal = ({ admissionId, onClose, onInvoiceGenerated }) => {
  const [liveBill, setLiveBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    dischargeSummary: "Patient successfully recovered and discharged.",
    discountAmount: 0,
    discountPercentage: 0,
    gstPercentage: 0,
    paymentMethod: "CASH",
    initialPaymentAmount: 0,
  });

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const res = await BillingAPI.getLiveBill(admissionId);
        setLiveBill(res.data);
        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            initialPaymentAmount: res.data.runningTotal || 0,
          }));
        }
      } catch (err) {
        setError("Failed to fetch running bill details.");
      } finally {
        setLoading(false);
      }
    };
    if (admissionId) fetchBill();
  }, [admissionId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const calculateTotals = () => {
    const sub = liveBill ? liveBill.runningTotal || 0 : 0;
    let disc = parseFloat(formData.discountAmount) || 0;
    if (formData.discountPercentage > 0) {
      disc = (sub * parseFloat(formData.discountPercentage)) / 100;
    }
    const afterDisc = Math.max(0, sub - disc);
    const gst = (afterDisc * (parseFloat(formData.gstPercentage) || 0)) / 100;
    const grand = afterDisc + gst;
    return { subtotal: sub, discount: disc, gst, grandTotal: grand };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await BillingAPI.generateDischargeInvoice(admissionId, {
        dischargeSummary: formData.dischargeSummary,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        gstPercentage: parseFloat(formData.gstPercentage) || 0,
        paymentMethod: formData.paymentMethod,
        initialPaymentAmount: parseFloat(formData.initialPaymentAmount) || 0,
      });

      if (onInvoiceGenerated) {
        onInvoiceGenerated(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate discharge invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!admissionId) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title fw-bold">🏥 Discharge & Generate Final Invoice</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-danger"></div>
                  <p className="mt-2 text-muted">Calculating final bill...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <>
                  {/* Patient Info */}
                  <div className="alert alert-light border mb-3">
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Patient:</strong> {liveBill?.patientName} ({liveBill?.registrationNumber})
                      </div>
                      <div className="col-md-6">
                        <strong>Admitted:</strong> {new Date(liveBill?.admittedAt).toLocaleDateString()} ({liveBill?.daysAdmitted} Days)
                      </div>
                    </div>
                  </div>

                  {/* Discharge Summary */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Discharge Summary / Clinical Notes</label>
                    <textarea
                      name="dischargeSummary"
                      className="form-control"
                      rows="2"
                      value={formData.dischargeSummary}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {/* Financial Inputs: Discount & GST */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Discount Flat (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="discountAmount"
                        className="form-control"
                        value={formData.discountAmount}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Discount (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="discountPercentage"
                        className="form-control"
                        value={formData.discountPercentage}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">GST Tax (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="gstPercentage"
                        className="form-control"
                        value={formData.gstPercentage}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Payment Method & Initial Deposit */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Payment Method</label>
                      <select
                        name="paymentMethod"
                        className="form-select"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                      >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI / QR</option>
                        <option value="CARD">Debit / Credit Card</option>
                        <option value="NET_BANKING">Net Banking</option>
                        <option value="INSURANCE">Insurance Claim</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Payment Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="initialPaymentAmount"
                        className="form-control"
                        value={formData.initialPaymentAmount}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Financial Summary Card */}
                  <div className="card bg-light border-0 shadow-sm p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span className="fw-semibold">₹ {totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-danger">
                        <span>Discount:</span>
                        <span>- ₹ {totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {totals.gst > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-muted">
                        <span>GST Tax ({formData.gstPercentage}%):</span>
                        <span>+ ₹ {totals.gst.toFixed(2)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fs-4 fw-bold text-success">
                      <span>Grand Total:</span>
                      <span>₹ {totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submitting || loading}>
                {submitting ? "Processing Discharge..." : "🧾 Generate Invoice & Discharge"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DischargeBillingModal;
