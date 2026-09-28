import { describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";
import { getApiHealth } from "@/lib/api/health";
import { createApiTransport } from "@/lib/api/transport";

describe("Vey API health", () => {
  it("calls the backend health path and decodes its response", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      data: {
        code: 1000,
        message: "Success",
        result: { service: "vey-api", status: "UP" },
      },
    });
    const client = createApiTransport({
      baseUrl: "http://localhost:8081",
      axiosInstance: { request } as unknown as AxiosInstance,
    });
    expect((await getApiHealth(client)).result.status).toBe("UP");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/health" }),
    );
  });
});
