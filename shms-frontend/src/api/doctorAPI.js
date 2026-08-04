import API from './axiosConfig';

const DoctorAPI = {

  getMySchedule: () =>
    API.get('/api/appointments/doctor-schedule'),

  completeAppointment: (apptId, data) =>
    API.put(
      `/api/appointments/${apptId}/complete`,
      data
    ),

  createPrescription: (data) =>
    API.post('/api/prescriptions', data),

  orderLabTest: (data) =>
    API.post('/api/lab-reports/order', data),

  addSlot: (data) =>
    API.post('/api/doctors/slots', data),

  getPatientAllergies: (patientId) =>
    API.get(`/api/patients/${patientId}/allergies`),

  getPatientMedicalHistory: (patientId) =>
    API.get(
      `/api/patients/${patientId}/medical-history`
    ),

  getPatientPrescriptions: (patientId) =>
    API.get(`/api/prescriptions/patient/${patientId}`),

  getPatientLabReports: (patientId) =>
    API.get(`/api/lab-reports/patient/${patientId}`),
};

export default DoctorAPI;