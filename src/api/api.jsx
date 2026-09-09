import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:44353",
  // baseURL: "https://gme-uoa-invoicingapi.testweb.bp.com/",
});

import { startLoading, stopLoading } from "./loadingService";

API.interceptors.request.use(
  (config) => {
    startLoading();
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (res) => {
    stopLoading();
    return res;
  },
  (err) => {
    stopLoading();
    return Promise.reject(err);
  }
);

export default API;