import React, { useState } from "react";
import BillingAPI from "../../api/billingAPI";

const CHARGE_CATEGORIES = [
  "ROOM",
  "DOCTOR_CONSULTATION",
  "SPECIALIST_CONSULTATION",
  "MEDICINE",
  "LABORATORY",
  "RADIOLOGY",
  "OPERATION",
  "ICU",
  "NURSING",
  "INJECTION",
  "EMERGENCY",
  "AMBULANCE",
  "EQUIPMENT",
  "MISCELLANEOUS",
];

const AddChargeModal = ({ admissionId, onClose, onChargeAdded }) => {
  const [formData, setFormData] = useState({
    chargeName: "",
    category: "DOCTOR_CONSULTATION",
    amount: "",
    quantity: 1,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await BillingAPI.addCharge({
        admissionId,
        chargeName: formData.chargeName,
        category: formData.category,
        amount: parseFloat(formData.amount),
        quantity: parseInt(formData.quantity, 10) || 1,
        notes: formData.notes,
      });

      setSuccessMsg("Charge added to running bill successfully!");
      if (onChargeAdded) onChargeAdded();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add charge.");
    } finally {
      setLoading(false);
    }
  };

  if (!admissionId) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold">➕ Add Hospital Charge</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {successMsg && <div className="alert alert-success">{successMsg}</div>}

              {/* Charge Category */}
              <div className="mb-3">
                <label className="form-label fw-bold">Category</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CHARGE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Charge Name */}
              <div className="mb-3">
                <label className="form-label fw-bold">Charge Description / Item Name</label>
                <input
                  type="text"
                  name="chargeName"
                  className="form-control"
                  placeholder="e.g. Daily Specialist Visit, Blood Test, MRI Scan"
                  value={formData.chargeName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Amount & Quantity */}
              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="form-label fw-bold">Unit Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    className="form-control"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-bold">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="form-label text-muted">Notes / Details (Optional)</label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="2"
                  placeholder="Additional context or prescription reference..."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Adding Charge..." : "✓ Confirm Charge"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChargeModal;
