import API from "./axiosConfig";

const BillingAPI = {
  // Admit patient
  admitPatient: (data) => API.post("/api/billing/admit", data),

  // Available beds
  getAvailableBeds: () => API.get("/api/billing/beds/available"),

  // Step 2: Add charge
  addCharge: (data) => API.post("/api/billing/charges/add", data),

  // Step 3: Get live bill
  getLiveBill: (admissionId) => API.get(`/api/billing/live-bill/${admissionId}`),

  // Step 4 & 5: Discharge & generate invoice
  generateDischargeInvoice: (admissionId, data) =>
    API.post(`/api/billing/discharge-invoice/${admissionId}`, data),

  // Legacy discharge
  initiateDischarge: (admissionId, data) =>
    API.post(`/api/billing/discharge/${admissionId}`, data),

  // Step 6: Invoice details & PDF
  getInvoiceDetails: (invoiceId) => API.get(`/api/billing/invoices/${invoiceId}`),
  
  getInvoiceByAdmission: (admissionId) => API.get(`/api/billing/invoices/admission/${admissionId}`),

  getInvoicePdfBlob: (invoiceId) =>
    API.get(`/api/billing/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    }),

  // Step 7: Process payment
  processPayment: (data) => API.post("/api/billing/payments/process", data),

  // Step 8: Search & history
  searchInvoices: (query = "") =>
    API.get(`/api/billing/invoices/search?query=${encodeURIComponent(query)}`),

  getMyInvoices: () => API.get("/api/billing/invoices/my"),

  // Admissions
  getActiveAdmissions: () => API.get("/api/billing/admissions/active"),
  getAllAdmissions: () => API.get("/api/billing/admissions"),
};

export default BillingAPI;
