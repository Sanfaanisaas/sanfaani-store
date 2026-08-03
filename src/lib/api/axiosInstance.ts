import axios from "axios";

// Use the Next.js rewrite proxy (/api/*) so requests go through the same origin,
// avoiding CORS entirely. NEXT_PUBLIC_API_URL is only used server-side if needed.
const baseURL =
  typeof window !== "undefined"
    ? "/api" // browser: use the Next.js rewrite proxy (same origin, no CORS)
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; // SSR: direct

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  const { store } = await import("@/lib/redux/store");
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;