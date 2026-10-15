"use client";

import axios from "axios";
import { getApiBaseUrl } from "./config";
import { routes } from "@/config/routes";

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_API_BASE_URL is not configured."),
    );
  }
  return config;
});

let restoringSession = false;
apiClient.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    !error.config?.url?.startsWith("/api/v1/auth/") &&
    typeof window !== "undefined" &&
    !restoringSession
  ) {
    restoringSession = true;
    window.location.assign(routes.authComplete);
  }
  return Promise.reject(error);
});

export { apiClient };
