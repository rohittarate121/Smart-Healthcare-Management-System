import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
// Automatically adds JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
// Handles 401 globally — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/api/auth/");

      if (!isAuthEndpoint) {
        localStorage.removeItem("shms_token");
        localStorage.removeItem("shms_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
