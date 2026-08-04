import API from "./axiosConfig";

const AuthAPI = {
  register: (data) => API.post("/api/auth/register", data),

  verifyOtp: (data) => API.post("/api/auth/verify-otp", data),

  login: (data) => API.post("/api/auth/login", data),

  verifyLoginOtp: (data) => API.post("/api/auth/login/verify-otp", data),

  createStaff: (data) => API.post("/api/auth/admin/create-staff", data),

  forgotPassword: (data) => API.post("/api/auth/forgot-password", data),

  resetPassword: (data) => API.post("/api/auth/reset-password", data),
};

export default AuthAPI;
