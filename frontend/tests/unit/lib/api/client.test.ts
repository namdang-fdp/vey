import type { InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { apiClient } from "@/lib/api/client";

describe("business API client", () => {
  it("keeps credentials enabled without injecting a Better Auth bearer token", async () => {
    const previousBaseURL = apiClient.defaults.baseURL;
    const previousAdapter = apiClient.defaults.adapter;
    let requestConfig: InternalAxiosRequestConfig | undefined;
    apiClient.defaults.baseURL = "https://spring.example.test";
    apiClient.defaults.adapter = async (config) => {
      requestConfig = config;
      return {
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    try {
      await apiClient.get("/meetings");
      expect(requestConfig?.headers.get("Authorization")).toBeUndefined();
      expect(requestConfig?.withCredentials).toBe(true);
    } finally {
      apiClient.defaults.baseURL = previousBaseURL;
      apiClient.defaults.adapter = previousAdapter;
    }
  });
});
