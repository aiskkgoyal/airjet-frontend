// src/api.ts
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "https://6acfdff3-d03c-4661-9633-68037d93ae64-00-12sv7mrryoumn.sisko.replit.dev") + "/api";

const api = axios.create({
  baseURL: baseURL.replace(/\/$/, ""), // trim trailing slash
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 20000,
});

// optional: response interceptor to handle 401 etc
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // simple logging; you can extend
    console.error("API error:", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

export default api;