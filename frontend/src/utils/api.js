import axios from "axios";
import { toast } from "react-toastify";

// API Base URL - use localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Store reference for dispatching logout
let logoutCallback = null;

// Function to set logout callback from the app
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle logout - clear storage, show toast, redirect
const handleSessionExpired = () => {
  localStorage.removeItem("auth");

  // Call the logout callback if set (dispatches Redux action)
  if (logoutCallback) {
    logoutCallback();
  }

  // Show toast notification
  toast.error("Your session has expired. Please log in again.", {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  // Redirect to home page after a short delay
  setTimeout(() => {
    window.location.href = "/";
  }, 1000);
};

export const refreshTokens = async (refresh) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/core/auth/refresh/`,
      { refresh },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return {
      access: data.access,
      refresh: data.refresh || refresh,
    };
  } catch (error) {
    console.error("Token Refresh Error:", error);
    throw error;
  }
};

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth?.access) {
      config.headers.Authorization = `Bearer ${auth.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Check if error is auth-related (401 or 403)
    const isAuthError = status === 401 || status === 403;

    // Don't retry for login/register endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    if (isAuthError && !originalRequest._retry && !isAuthEndpoint) {
      // For 403 errors, check if it's specifically a token issue
      const errorDetail = error.response?.data?.detail?.toLowerCase() || "";
      const isTokenError =
        status === 401 ||
        errorDetail.includes("token") ||
        errorDetail.includes("credential") ||
        errorDetail.includes("authentication") ||
        errorDetail.includes("not valid");

      if (!isTokenError && status === 403) {
        // This is a permission error, not a token error
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const auth = JSON.parse(localStorage.getItem("auth"));

      if (!auth?.refresh) {
        // No refresh token, session expired
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        const tokens = await refreshTokens(auth.refresh);

        // Update stored tokens
        const updatedAuth = { ...auth, ...tokens };
        localStorage.setItem("auth", JSON.stringify(updatedAuth));

        // Update default header
        api.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;

        // Process queued requests
        processQueue(null, tokens.access);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed, session expired
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
