import axios, { type AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createApiTransport, createAxiosInstance } from "@/lib/api/transport";
import { ApiConfigurationError, ApiNetworkError } from "@/lib/api/errors";

function testAxiosInstance(request = vi.fn()) {
  return { axiosInstance: { request } as unknown as AxiosInstance, request };
}

describe("API transport", () => {
  it("does not request without configuration", async () => {
    const { axiosInstance, request } = testAxiosInstance();
    await expect(
      createApiTransport({ axiosInstance }).request("/resource", {
        decode: z.unknown().parse,
      }),
    ).rejects.toBeInstanceOf(ApiConfigurationError);
    expect(request).not.toHaveBeenCalled();
  });
  it("decodes a valid Vey response through the configured relative path", async () => {
    const { axiosInstance, request } = testAxiosInstance(
      vi.fn().mockResolvedValue({ status: 200, data: { value: 1 } }),
    );
    const client = createApiTransport({
      baseUrl: "https://example.test/api",
      axiosInstance,
    });
    expect(
      await client.request("/resource", {
        decode: z.object({ value: z.number() }).parse,
      }),
    ).toEqual({ value: 1 });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/resource", data: undefined }),
    );
  });
  it("configures Axios with the API base URL and credentials", () => {
    const request = vi.fn();
    const create = vi
      .spyOn(axios, "create")
      .mockReturnValue({ request } as unknown as AxiosInstance);

    createAxiosInstance("https://example.test/api");

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://example.test/api",
        withCredentials: true,
        timeout: 10_000,
      }),
    );
  });
  it("normalizes HTTP failures", async () => {
    const { axiosInstance } = testAxiosInstance(
      vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { status: 503, data: { code: 5001, message: "Unavailable" } },
      }),
    );
    const client = createApiTransport({
      baseUrl: "https://example.test",
      axiosInstance,
    });
    await expect(
      client.request("/resource", { decode: z.unknown().parse }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      body: { code: 5001, message: "Unavailable" },
    });
  });
  it("normalizes network failures", async () => {
    const { axiosInstance } = testAxiosInstance(
      vi.fn().mockRejectedValue({ isAxiosError: true, request: {} }),
    );
    const client = createApiTransport({
      baseUrl: "https://example.test",
      axiosInstance,
    });
    await expect(
      client.request("/resource", { decode: z.unknown().parse }),
    ).rejects.toBeInstanceOf(ApiNetworkError);
  });
  it("retains Zod decoding and supports empty responses", async () => {
    const { axiosInstance } = testAxiosInstance(
      vi
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { invalid: true } })
        .mockResolvedValueOnce({ status: 204, data: "" }),
    );
    const client = createApiTransport({
      baseUrl: "https://example.test",
      axiosInstance,
    });
    await expect(
      client.request("/resource", {
        decode: z.object({ value: z.number() }).parse,
      }),
    ).rejects.toBeInstanceOf(z.ZodError);
    await expect(
      client.request("/resource", { decode: z.undefined().parse }),
    ).resolves.toBeUndefined();
  });
  it("rejects externally supplied origins", async () => {
    const { axiosInstance, request } = testAxiosInstance();
    const client = createApiTransport({
      baseUrl: "https://example.test",
      axiosInstance,
    });
    await expect(
      client.request("//other.test", { decode: z.unknown().parse }),
    ).rejects.toBeInstanceOf(TypeError);
    expect(request).not.toHaveBeenCalled();
  });
});
