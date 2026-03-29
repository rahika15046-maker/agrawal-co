import axios from "axios";

export const api = axios.create({
  baseURL: "https://agrawal-co-production.up.railway.app/api",
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
    const isLoginRoute = err.config?.url?.includes('/auth/login');

    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('agrawal-admin');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;