import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://agrawal-co-production.up.railway.app/api",
  withCredentials: true,
});

// 🔐 Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("agrawal-auth");

      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token || parsed?.token;

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error("Token parse error:", err);
    }
  }
  return config;
});

// 🚫 Handle 401 (auto logout)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("agrawal-auth");

      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── API HELPERS ──────────────────────────────────────────

// 🛍 Products
export const fetchProducts = async (params: Record<string, any>) => {
  const { data } = await api.get("/products", { params });
  return data;
};

export const fetchProduct = async (slug: string) => {
  const { data } = await api.get(`/products/${slug}`);
  return data.product;
};

// 📂 Categories
export const fetchCategories = async () => {
  const { data } = await api.get("/categories");
  return data.categories;
};

// 📦 Orders (VERY IMPORTANT FIXED)
export const fetchMyOrders = async () => {
  const { data } = await api.get("/orders/my");
  return data.orders || []; // ✅ always return array (prevents UI crash)
};

export const fetchOrderById = async (id: string) => {
  const res = await api.get(`/orders/${id}`);
  return res.data; // { order: {...} }
};