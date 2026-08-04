import API from "./axiosConfig";

const AdminAPI = {
  // Dashboard
  getDashboardStats: () => API.get("/api/admin/dashboard"),

  getRevenueAnalytics: () => API.get("/api/admin/analytics/revenue"),

  // Users
  getAllUsers: () => API.get("/api/admin/users"),

  getUsersByRole: (role) => API.get(`/api/admin/users/role/${role}`),

  updateUserStatus: (userId, data) =>
    API.put(`/api/admin/users/${userId}/status`, data),

  createStaff: (data) => API.post("/api/auth/admin/create-staff", data),

  // Doctors
  getAllDoctors: () => API.get("/api/admin/doctors"),

  // Patients
  getAllPatients: () => API.get("/api/admin/patients"),

  // Appointments
  getAllAppointments: () => API.get("/api/admin/appointments"),

  // Billing
  getAllAdmissions: () => API.get("/api/billing/admissions"),

  getActiveAdmissions: () => API.get("/api/billing/admissions/active"),

  getAvailableBeds: () => API.get("/api/billing/beds/available"),

  admitPatient: (data) => API.post("/api/billing/admit", data),

  initiateDischarge: (admissionId, data) =>
    API.post(`/api/billing/discharge/${admissionId}`, data),

  // Insurance Claims
  getAllClaims: () => API.get("/api/billing/claims"),

  getPendingClaims: () => API.get("/api/billing/claims/pending"),

  updateClaimStatus: (claimId, data) =>
    API.put(`/api/billing/claims/${claimId}/status`, data),

  // Notifications
  getAllNotifications: () => API.get("/api/admin/notifications"),
};

export default AdminAPI;
