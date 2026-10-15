import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  signJWT,
  routeHandler,
  createRouter,
  transaction,
  context,
  authOptions,
} = vi.hoisted(() => ({
  signJWT: vi.fn(),
  routeHandler: vi.fn(),
  createRouter: vi.fn(),
  transaction: vi.fn(),
  context: { adapter: { id: "identity-database-adapter" } },
  authOptions: { baseURL: "http://localhost:3000" },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/server", () => ({
  auth: {
    api: { signJWT },
    $context: Promise.resolve(context),
    options: authOptions,
  },
}));
vi.mock("better-auth/api", () => ({ router: createRouter }));
vi.mock("@better-auth/core/context", () => ({
  runWithTransaction: transaction,
}));

import { resetPasswordTransaction } from "@/lib/auth/password-reset";

function resetRequest(origin: string | null = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/auth/reset-password", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify({ token: "reset-token", newPassword: "new-password" }),
  });
}

describe("resetPasswordTransaction", () => {
  let events: string[];
  let inTransaction: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    events = [];
    inTransaction = false;
    signJWT.mockImplementation(async () => {
      events.push("warm-key");
      return { token: "inert-warmup-token" };
    });
    createRouter.mockReturnValue({ handler: routeHandler });
    routeHandler.mockImplementation(async () => {
      expect(inTransaction).toBe(true);
      events.push("route-handler");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    // This records orchestration only. Real database rollback is integration-tested separately.
    transaction.mockImplementation(async (_adapter, callback) => {
      events.push("begin");
      inTransaction = true;
      try {
        const result = await callback();
        events.push("commit");
        return result;
      } catch (error) {
        events.push("rollback");
        throw error;
      } finally {
        inTransaction = false;
      }
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it.each([null, "http://attacker.example", "http://localhost:3001"])(
    "rejects Origin %s before any identity mutation",
    async (origin) => {
      const response = await resetPasswordTransaction(resetRequest(origin));

      expect(response.status).toBe(403);
      expect(transaction).not.toHaveBeenCalled();
      expect(routeHandler).not.toHaveBeenCalled();
    },
  );

  it("warms the signing key before running the original HTTP handler in a transaction", async () => {
    const request = resetRequest();

    const response = await resetPasswordTransaction(request);

    expect(response.status).toBe(200);
    expect(signJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          payload: expect.objectContaining({ token_use: "key_warmup" }),
        }),
      }),
    );
    expect(createRouter).toHaveBeenCalledWith(context, authOptions);
    expect(transaction).toHaveBeenCalledWith(
      context.adapter,
      expect.any(Function),
    );
    expect(routeHandler).toHaveBeenCalledOnce();
    const forwarded = routeHandler.mock.calls[0][0] as Request;
    expect(forwarded.url).toBe(request.url);
    expect(forwarded.method).toBe(request.method);
    expect([...forwarded.headers]).toEqual([...request.headers]);
    expect(await forwarded.json()).toEqual({
      token: "reset-token",
      newPassword: "new-password",
    });
    expect(events).toEqual(["warm-key", "begin", "route-handler", "commit"]);
  });

  it("rejects a body larger than 8192 bytes before signing or opening a transaction", async () => {
    const request = new Request(
      "http://localhost:3000/api/auth/reset-password",
      {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: new Uint8Array(8193),
      },
    );

    const response = await resetPasswordTransaction(request);

    expect(response.status).toBe(413);
    expect(signJWT).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
  });

  it("enforces the accumulated streaming byte limit without trusting Content-Length", async () => {
    const cancelled = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(4096));
        controller.enqueue(new Uint8Array(4097));
      },
      cancel: cancelled,
    });
    const init: RequestInit & { duplex: "half" } = {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-length": "1" },
      body: stream,
      duplex: "half",
    };

    const response = await resetPasswordTransaction(
      new Request("http://localhost:3000/api/auth/reset-password", init),
    );

    expect(response.status).toBe(413);
    expect(cancelled).toHaveBeenCalledOnce();
    expect(signJWT).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
  });

  it("accepts a fully buffered request at the 8192-byte boundary", async () => {
    const request = new Request(
      "http://localhost:3000/api/auth/reset-password",
      {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: new Uint8Array(8192),
      },
    );

    const response = await resetPasswordTransaction(request);

    expect(response.status).toBe(200);
    const forwarded = routeHandler.mock.calls[0][0] as Request;
    expect((await forwarded.arrayBuffer()).byteLength).toBe(8192);
    expect(events).toEqual(["warm-key", "begin", "route-handler", "commit"]);
  });

  it("times out a stalled request body before signing or opening a transaction", async () => {
    vi.useFakeTimers();
    const cancelled = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(1));
      },
      cancel: cancelled,
    });
    const init: RequestInit & { duplex: "half" } = {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
      body: stream,
      duplex: "half",
    };
    const pending = resetPasswordTransaction(
      new Request("http://localhost:3000/api/auth/reset-password", init),
    );

    await vi.advanceTimersByTimeAsync(5001);
    const response = await pending;

    expect(response.status).toBe(408);
    expect(cancelled).toHaveBeenCalledOnce();
    expect(signJWT).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
  });

  it("returns the original successful response after committing", async () => {
    const original = new Response("reset successful", { status: 200 });
    routeHandler.mockImplementation(async () => {
      expect(inTransaction).toBe(true);
      return original;
    });

    expect(await resetPasswordTransaction(resetRequest())).toBe(original);
    expect(events).toEqual(["warm-key", "begin", "commit"]);
  });

  it.each([400, 403, 429, 503])(
    "rolls back an HTTP %s response before returning it unchanged",
    async (status) => {
      const original = new Response("original auth error", { status });
      routeHandler.mockImplementation(async () => {
        expect(inTransaction).toBe(true);
        events.push("route-handler");
        return original;
      });

      expect(await resetPasswordTransaction(resetRequest())).toBe(original);
      expect(events).toEqual([
        "warm-key",
        "begin",
        "route-handler",
        "rollback",
      ]);
    },
  );

  it("rolls back unexpected handler errors and returns a generic 503", async () => {
    routeHandler.mockImplementation(async () => {
      expect(inTransaction).toBe(true);
      events.push("route-handler");
      throw new Error("private password mutation failure");
    });

    const response = await resetPasswordTransaction(resetRequest());

    expect(response.status).toBe(503);
    expect(events).toEqual(["warm-key", "begin", "route-handler", "rollback"]);
    expect(await response.text()).not.toContain(
      "private password mutation failure",
    );
  });

  it("returns generic 503 without entering a transaction when key warmup fails", async () => {
    signJWT.mockRejectedValue(new Error("private signing key failure"));

    const response = await resetPasswordTransaction(resetRequest());

    expect(response.status).toBe(503);
    expect(transaction).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain("private signing key failure");
  });

  it("returns generic 503 when the transaction infrastructure fails", async () => {
    transaction.mockRejectedValue(
      new Error("private database connection failure"),
    );

    const response = await resetPasswordTransaction(resetRequest());

    expect(response.status).toBe(503);
    expect(routeHandler).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain(
      "private database connection failure",
    );
  });
});
