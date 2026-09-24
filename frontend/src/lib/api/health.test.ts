import { describe, expect, it, vi } from "vitest";
import { getApiHealth } from "./health";
import { createApiTransport } from "./transport";

describe("Vey API health", () => {
  it("calls the backend health path and decodes its response", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 1000,
          message: "Success",
          result: { service: "vey-api", status: "UP" },
        }),
        { headers: { "content-type": "application/json" } },
      ),
    );
    const client = createApiTransport({
      baseUrl: "http://localhost:8081",
      fetcher,
    });
    expect((await getApiHealth(client)).result.status).toBe("UP");
    expect(fetcher.mock.calls[0]?.[0].toString()).toBe(
      "http://localhost:8081/api/v1/health",
    );
  });
});
