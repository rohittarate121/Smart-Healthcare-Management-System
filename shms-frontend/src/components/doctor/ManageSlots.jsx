import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DoctorAPI from "../../api/doctorAPI";
import API from "../../api/axiosConfig";

const ManageSlots = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slotDate: "",
    startTime: "",
    endTime: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchMySlots();
  }, []);

  const fetchMySlots = async () => {
    setLoading(true);
    try {
      // Get doctor's own slots — all slots
      const res = await API.get("/api/appointments/doctor-schedule");
      // Extract slots from appointments +
      // fetch raw availability separately
      const slotsRes = await API.get("/api/doctors/my-slots");
      setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
    } catch (err) {
      // Fallback — try alternate endpoint
      try {
        const res = await API.get("/api/doctors/slots/my");
        setSlots(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSlots([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await DoctorAPI.addSlot(form);
      setSuccess(`Slot added: ${form.slotDate} at ${form.startTime}`);
      setForm({ slotDate: "", startTime: "", endTime: "" });
      fetchMySlots();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!form.slotDate) {
      setError("Select a date first.");
      return;
    }
    const times = [
      { start: "09:00:00", end: "09:30:00" },
      { start: "09:30:00", end: "10:00:00" },
      { start: "10:00:00", end: "10:30:00" },
      { start: "10:30:00", end: "11:00:00" },
      { start: "11:00:00", end: "11:30:00" },
      { start: "14:00:00", end: "14:30:00" },
      { start: "14:30:00", end: "15:00:00" },
      { start: "15:00:00", end: "15:30:00" },
    ];
    setSaving(true);
    let added = 0;
    for (const t of times) {
      try {
        await DoctorAPI.addSlot({
          slotDate: form.slotDate,
          startTime: t.start,
          endTime: t.end,
        });
        added++;
      } catch {}
    }
    setSuccess(`Added ${added} slots for ${form.slotDate}`);
    fetchMySlots();
    setSaving(false);
  };

  const filtered = filterDate
    ? slots.filter((s) => s.slotDate === filterDate)
    : slots;

  return (
    <div>
      <h4 className="fw-bold mb-4">🕐 Manage Availability Slots</h4>

      {success && <div className="alert alert-success py-2">✅ {success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Add Slot Form */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="fw-bold mb-3">Add New Slot</h6>
        <form onSubmit={handleAddSlot}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="slotDate"
                className="form-control"
                value={form.slotDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                name="startTime"
                className="form-control"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Time</label>
              <input
                type="time"
                name="endTime"
                className="form-control"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              + Add Single Slot
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleBulkAdd}
              disabled={saving || !form.slotDate}
            >
              ⚡ Add Full Day (8 slots)
            </button>
          </div>
        </form>
      </div>

      {/* Existing Slots */}
      <div className="card border-0 shadow-sm p-4">
        <div
          className="d-flex
          justify-content-between mb-3"
        >
          <h6 className="fw-bold mb-0">My Slots ({slots.length} total)</h6>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filter by date"
            />
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setFilterDate("")}
            >
              Clear
            </button>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={fetchMySlots}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-3">
            <div
              className="spinner-border
              spinner-border-sm text-primary"
            />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center py-3">
            No slots found. Add slots above.
          </p>
        ) : (
          <div className="table-responsive">
            <table
              className="table table-sm
              table-hover"
            >
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((slot) => (
                  <tr key={slot.availId}>
                    <td>{slot.slotDate}</td>
                    <td>{slot.startTime}</td>
                    <td>{slot.endTime}</td>
                    <td>
                      <span
                        className={`badge ${
                          slot.isBooked ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {slot.isBooked ? "Booked" : "Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlots;
