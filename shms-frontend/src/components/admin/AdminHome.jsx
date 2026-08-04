import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AdminAPI from "../../api/adminAPI";

const COLORS = [
  "#0d6efd",
  "#198754",
  "#fd7e14",
  "#6f42c1",
  "#dc3545",
  "#0dcaf0",
];

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.allSettled([
        AdminAPI.getDashboardStats(),
        AdminAPI.getRevenueAnalytics(),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }

      if (revenueRes.status === "fulfilled") {
        // Convert revenue map to array for Recharts
        const revenueData = Object.entries(revenueRes.value.data).map(
          ([name, value]) => ({
            name: name.replace("_", " "),
            amount: value,
          }),
        );
        setRevenue(revenueData);
      }
    } catch (err) {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  // Bed occupancy data for pie chart
  const bedData = [
    {
      name: "Occupied",
      value: stats?.bedsOccupied || 0,
    },
    {
      name: "Available",
      value: stats?.bedsAvailable || 0,
    },
  ];

  const statCards = [
    {
      label: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: "👥",
      color: "#0d6efd",
      bg: "#e7f1ff",
    },
    {
      label: "Total Doctors",
      value: stats?.totalDoctors || 0,
      icon: "👨‍⚕️",
      color: "#198754",
      bg: "#e8f5e9",
    },
    {
      label: "Total Appointments",
      value: stats?.totalAppointments || 0,
      icon: "📅",
      color: "#6f42c1",
      bg: "#f3e5f5",
    },
    {
      label: "Active Admissions",
      value: stats?.admissionsActive || 0,
      icon: "🏥",
      color: "#fd7e14",
      bg: "#fff3e0",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: "💰",
      color: "#198754",
      bg: "#e8f5e9",
    },
    {
      label: "Pending Claims",
      value: stats?.pendingInsuranceClaims || 0,
      icon: "🛡️",
      color: "#dc3545",
      bg: "#fce4e4",
    },
    {
      label: "Pending Lab Reports",
      value: stats?.pendingLabReports || 0,
      icon: "🔬",
      color: "#0dcaf0",
      bg: "#e0f7fa",
    },
    {
      label: "Beds Available",
      value: stats?.bedsAvailable || 0,
      icon: "🛏️",
      color: "#fd7e14",
      bg: "#fff3e0",
    },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-1">📊 Admin Dashboard</h4>
      <p className="text-muted mb-4">Real-time hospital overview</p>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="col-md-3 col-sm-6">
            <div
              className="card border-0 shadow-sm p-3"
              style={{ backgroundColor: card.bg }}
            >
              <div
                className="d-flex
                justify-content-between
                align-items-center"
              >
                <div>
                  <p className="text-muted small mb-1">{card.label}</p>
                  <h4 className="fw-bold mb-0" style={{ color: card.color }}>
                    {card.value}
                  </h4>
                </div>
                <div style={{ fontSize: "2rem" }}>{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3">
        {/* Revenue Bar Chart */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">💰 Revenue by Payment Type</h6>
            {revenue.length === 0 ? (
              <p className="text-muted text-center py-4">
                No payment data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `₹${v.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="amount" fill="#0d6efd" radius={[4, 4, 0, 0]}>
                    {revenue.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bed Occupancy Pie Chart */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">🛏️ Bed Occupancy</h6>
            {stats?.bedsOccupied === 0 && stats?.bedsAvailable === 0 ? (
              <p className="text-muted text-center py-4">No bed data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={bedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bedData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? "#dc3545" : "#198754"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
