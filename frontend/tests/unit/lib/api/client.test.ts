import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("business API session recovery", () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    navigate.mockReset();
    vi.stubGlobal("window", { location: { assign: navigate } });
  });

  afterEach(() => vi.unstubAllGlobals());

  async function failingClient(status: number) {
    const { apiClient: client } = await import("@/lib/api/client");
    client.defaults.baseURL = "https://spring.example.test";
    client.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Request failed",
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        {
          data: {},
          status,
          statusText: "Request failed",
          headers: {},
          config,
        },
      );
    };
    return client;
  }

  it("starts one recovery navigation for concurrent unauthorized business requests", async () => {
    const client = await failingClient(401);

    const results = await Promise.allSettled([
      client.get("/api/v1/meetings"),
      client.get("/api/v1/calendar"),
    ]);

    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/auth/complete");
  });

  it("preserves forbidden workspace errors without attempting session recovery", async () => {
    const client = await failingClient(403);

    await expect(client.get("/api/v1/meetings")).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    "/api/v1/auth/me",
    "/api/v1/auth/session",
    "/api/v1/auth/session/logout",
  ])("does not create a recovery loop for unauthorized %s", async (path) => {
    const client = await failingClient(401);

    await expect(client.get(path)).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(navigate).not.toHaveBeenCalled();
  });
});
