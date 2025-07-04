import axios from "axios";

export const refreshTokens = async (refresh) => {
  try {
    const { data } = await axios.post(
      "http://127.0.0.1:8000/core/auth/refresh/", 
      { refresh },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return {
      access: data.access,
      refresh: data.refresh || refresh 
    };
  } catch (error) {
    console.error("Token Refresh Error:", error);
    throw error;
  }
};

const api = axios.create({
  baseURL:  'https://auto-eden-backend.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Add request interceptor for auth token
api.interceptors.request.use(config => {
  const token = JSON.parse(localStorage.getItem('auth'))?.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;