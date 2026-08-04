import API from "./axiosConfig";

const LabAPI = {
  getPendingOrders: () => API.get("/api/lab-reports/pending"),

  uploadReport: (labReportId, fileUrl, notes) =>
    API.put(`/api/lab-reports/${labReportId}/upload`, null, {
      params: { fileUrl, notes },
    }),

  markReviewed: (labReportId) =>
    API.put(`/api/lab-reports/${labReportId}/reviewed`),
};

export default LabAPI;
