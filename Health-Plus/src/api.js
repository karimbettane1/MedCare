// Sans REACT_APP_API_URL (ex: site statique sur GitHub Pages), l'API Laravel est
// injoignable : on bascule alors sur une couche démo stockée dans le navigateur.
import { createDemoApi } from "./demoApi";

const envApiUrl = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

export const isDemoMode = !envApiUrl;

const API_BASE_URL = envApiUrl || "http://127.0.0.1:8000/api/v1";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const config = {
    headers,
    credentials: "omit",
    ...options,
  };

  return fetch(url, config)
    .then(async response => {
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      if (contentType.includes("text/html")) {
        throw new Error(`Invalid response format from server (HTML received). URL: ${url}, Status: ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", { url, status: response.status, text });
        throw new Error(`Invalid response format from server (Received non-JSON). URL: ${url}, Status: ${response.status}`);
      }

      if (response.status === 401 && token) {
        // Jeton expiré ou révoqué : on purge la session locale au lieu de laisser
        // l'interface croire que l'utilisateur est encore connecté.
        ["token", "userId", "userType", "doctorId"].forEach((key) => localStorage.removeItem(key));
      }

      if (!response.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).flat().join(" ")
          : "";
        throw new Error(validationErrors || data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    });
}

const httpApi = {
  register: (body) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    if (isFormData) {
      const token = localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers,
        body,
      }).then(async (response) => {
        const text = await response.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid response format from server (Received non-JSON). URL: ${API_BASE_URL}/auth/register, Status: ${response.status}`);
        }

        if (!response.ok) {
          const validationErrors = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";
          throw new Error(validationErrors || data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
      });
    }

    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  forgotPassword: (body) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  resetPassword: (body) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctors${query ? `?${query}` : ""}`);
  },

  rateDoctor: (doctorId, rating) =>
    request(`/doctors/${doctorId}/rate`, {
      method: "PATCH",
      body: JSON.stringify({ rating }),
    }),

  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/appointments${query ? `?${query}` : ""}`);
  },

  getAvailability: (doctorId, date) =>
    request(`/appointments/availability?doctor_id=${doctorId}&date=${date}`),

  createAppointment: (body) =>
    request("/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAppointmentStatus: (appointmentId, status) =>
    request(`/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  submitDoctorRating: (appointmentId, patientId, rating) =>
    request(`/appointments/${appointmentId}/rate`, {
      method: "PATCH",
      body: JSON.stringify({ patient_id: patientId, rating }),
    }),

  getMedicalRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/medical-records${query ? `?${query}` : ""}`);
  },

  createMedicalRecord: (body) =>
    request("/medical-records", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateMedicalRecord: (recordId, body) =>
    request(`/medical-records/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getProfile: (userId) =>
    request(`/auth/profile?user_id=${userId}`),

  updateProfile: (userId, body) =>
    request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ ...body, user_id: userId }),
    }),

  chat: (body) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const api = isDemoMode ? createDemoApi() : httpApi;
