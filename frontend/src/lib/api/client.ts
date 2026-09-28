"use client";
import { getApiBaseUrl } from "./config";
import { createApiTransport } from "./transport";
import type { ApiRequest } from "./types";
/** Browser requests use the future Vey HttpOnly session cookie via Axios credentials. */
export function createBrowserApiClient() {
  const transport = createApiTransport({ baseUrl: getApiBaseUrl() });
  return {
    request: <T>(path: string, options: ApiRequest<T>) =>
      transport.request(path, options),
  };
}
