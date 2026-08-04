import API from "./axiosConfig";

const ReceptionAPI = {
  // Search existing patients
  searchPatients: (query) =>
    API.get(`/api/admin/patients/search?query=${query}`),

  // Register walk-in patient
  registerWalkIn: (data) => API.post("/api/auth/register-walkin", data),

  // Get doctors
  getAllDoctors: () => API.get("/api/doctors"),

  getDoctorsBySpecialty: (specialty) =>
    API.get(`/api/doctors/by-specialty?specialty=${specialty}`),

  getDoctorSlots: (doctorId, date) =>
    API.get(`/api/doctors/${doctorId}/slots${date ? `?date=${date}` : ""}`),

  // Book appointment
  bookAppointment: (data) => API.post("/api/appointments/book", data),

  // Check in patient
  checkInPatient: (apptId) => API.put(`/api/appointments/${apptId}/checkin`),

  // Get all appointments
  getAllAppointments: () => API.get("/api/admin/appointments"),
};

export default ReceptionAPI;
