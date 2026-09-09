import axios from "axios";
import { startLoading, stopLoading } from "./loadingService";

const instance = axios.create({
  baseURL: "/api"
});

// 🔐 Attach token and start loading
instance.interceptors.request.use((config) => {
  startLoading();
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => {
  stopLoading();
  return Promise.reject(err);
});

// 🔄 Refresh logic and stop loading on responses/errors
instance.interceptors.response.use(
  (res) => {
    stopLoading();
    return res;
  },
  async (err) => {
    stopLoading();
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post("/api/refresh", {
          refreshToken
        });

        localStorage.setItem("accessToken", res.data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        // ❌ logout if refresh fails
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default instance;