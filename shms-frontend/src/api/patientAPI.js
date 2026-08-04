import API from "./axiosConfig";

const PatientAPI = {
  // Profile
  getProfile: () => API.get("/api/patients/profile"),

  updateProfile: (data) => API.put("/api/patients/profile", data),

  // Medical History
  getMedicalHistory: () => API.get("/api/patients/medical-history"),

  addMedicalHistory: (data) => API.post("/api/patients/medical-history", data),

  // Allergies
  getAllergies: () => API.get("/api/patients/allergies"),

  addAllergy: (data) => API.post("/api/patients/allergies", data),

  // Insurance
  getInsurance: () => API.get("/api/patients/insurance"),

  addInsurance: (data) => API.post("/api/patients/insurance", data),

  // Triage
  analyseSymptoms: (data) => API.post("/api/triage/analyse", data),

  getTriageHistory: () => API.get("/api/triage/history"),

  // Doctors
  getDoctorsBySpecialty: (specialty) =>
    API.get(`/api/doctors/by-specialty?specialty=${specialty}`),

  getDoctorSlots: (doctorId, date) =>
    API.get(`/api/doctors/${doctorId}/slots${date ? `?date=${date}` : ""}`),

  // Appointments
  bookAppointment: (data) => API.post("/api/appointments/book", data),

  getMyAppointments: () => API.get("/api/appointments/my"),

  cancelAppointment: (apptId, reason) =>
    API.put(`/api/appointments/${apptId}/cancel`, null, { params: { reason } }),

  // Prescriptions
  getMyPrescriptions: () => API.get("/api/prescriptions/my"),

  // Lab Reports
  getMyLabReports: () => API.get("/api/lab-reports/my"),

  uploadExternalReport: (params) =>
    API.post("/api/lab-reports/upload-external", null, { params }),

  // Notifications
  getUnreadNotifications: () => API.get("/api/notifications/unread"),

  markNotificationRead: (notifId) =>
    API.put(`/api/notifications/${notifId}/read`),

  // Payments
  getMyPayments: () => API.get("/api/billing/payments/my"),
};

export default PatientAPI;
