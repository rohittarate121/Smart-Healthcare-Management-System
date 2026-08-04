import React, { useState, useEffect } from "react";
import AdminAPI from "../../api/adminAPI";

const roleColors = {
  PATIENT: "primary",
  DOCTOR: "success",
  RECEPTIONIST: "info",
  LAB_TECH: "warning",
  ADMIN: "danger",
  SUPER_ADMIN: "dark",
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await AdminAPI.getAllUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }

    setFiltered(result);
  };

  const toggleUserStatus = async (userId, current) => {
    setActionLoading(userId);
    try {
      await AdminAPI.updateUserStatus(userId, {
        isActive: !current,
        reason: current ? "Deactivated by admin" : "Activated by admin",
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">👥 Manage Users</h4>

      {/* Filters */}
      <div
        className="card border-0 shadow-sm
        p-3 mb-4"
      >
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label small">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small">Filter by Role</label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="LAB_TECH">Lab Tech</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div className="col-md-3">
            <p className="text-muted small mb-0">
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{users.length}</strong> users
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center
                        text-muted py-4"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.userId}>
                      <td className="text-muted small">#{user.userId}</td>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td className="small">{user.email}</td>
                      <td className="small">{user.phone}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            roleColors[user.role] || "secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.isActive ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.isVerified
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        {user.role !== "SUPER_ADMIN" && (
                          <button
                            className={`btn btn-sm ${
                              user.isActive
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              toggleUserStatus(user.userId, user.isActive)
                            }
                            disabled={actionLoading === user.userId}
                          >
                            {actionLoading === user.userId
                              ? "..."
                              : user.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
