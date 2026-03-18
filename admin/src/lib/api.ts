import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('agrawal-admin') || '{}');
    if (stored?.state?.token) {
      config.headers.Authorization = `Bearer ${stored.state.token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('agrawal-admin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
