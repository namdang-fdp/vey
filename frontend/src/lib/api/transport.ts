import axios, { isAxiosError, type AxiosInstance } from "axios";
import { ApiConfigurationError, ApiError, ApiNetworkError } from "./errors";
import type { ApiClient } from "./types";

const REQUEST_TIMEOUT_MS = 10_000;

export function createAxiosInstance(baseUrl: string): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { Accept: "application/json" },
  });
}

export function createApiTransport(config: {
  baseUrl?: string;
  axiosInstance?: AxiosInstance;
}): ApiClient {
  if (!config.baseUrl) {
    return {
      async request() {
        throw new ApiConfigurationError();
      },
    };
  }

  const baseUrl = new URL(config.baseUrl);
  const axiosInstance =
    config.axiosInstance ?? createAxiosInstance(baseUrl.href);

  return {
    async request(path, { decode, body, ...options }) {
      // Relative paths only: credentials must never be forwarded to a supplied origin.
      if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
        throw new TypeError("API path must start with a single slash.");

      try {
        const response = await axiosInstance.request<unknown>({
          ...options,
          url: path,
          data: body,
        });
        return decode(response.status === 204 ? undefined : response.data);
      } catch (cause) {
        if (isAxiosError(cause)) {
          if (cause.response) {
            throw new ApiError(
              `Request failed (${cause.response.status}).`,
              cause.response.status,
              cause.response.data,
            );
          }
          throw new ApiNetworkError();
        }
        throw cause;
      }
    },
  };
}
