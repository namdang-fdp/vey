import "server-only";

import { runWithTransaction } from "@better-auth/core/context";
import { router } from "better-auth/api";
import { auth } from "./server";

class ResetRollback extends Error {
  constructor(readonly response: Response) {
    super("Password reset did not complete");
  }
}

async function bufferResetRequest(
  request: Request,
): Promise<Request | Response> {
  if (!request.body) return request;
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  const read = async () => {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 8192) return new Response(null, { status: 413 });
      chunks.push(chunk.value);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
  };
  try {
    return await Promise.race([
      read(),
      new Promise<Response>((resolve) => {
        timer = setTimeout(
          () => resolve(new Response(null, { status: 408 })),
          5000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => undefined);
  }
}

export async function resetPasswordTransaction(
  request: Request,
): Promise<Response> {
  const origin = process.env.BETTER_AUTH_URL;
  if (!origin || request.headers.get("origin") !== new URL(origin).origin) {
    return Response.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  }
  try {
    // Never hold a database transaction while awaiting untrusted network input.
    const buffered = await bufferResetRequest(request);
    if (buffered instanceof Response) return buffered;
    // Signing outside the transaction provisions/rotates a committed key that Spring can read.
    const issuedAt = Math.floor(Date.now() / 1000);
    await auth.api.signJWT({
      body: {
        payload: {
          token_use: "key_warmup",
          iat: issuedAt,
          exp: issuedAt + 60,
        },
      },
    });
    const context = await auth.$context;
    return await runWithTransaction(context.adapter, async () => {
      // Use the HTTP router, preserving Better Auth validation, Origin checks and rate limits.
      // auth.handler would replace the active transaction's adapter context.
      // Better Auth's exported router accepts the default AuthContext generic only;
      // our context has the same runtime contract with additional JWT plugin types.
      const response = await router(
        context as unknown as Parameters<typeof router>[0],
        auth.options,
      ).handler(buffered);
      if (!response.ok) throw new ResetRollback(response);
      return response;
    });
  } catch (error) {
    if (error instanceof ResetRollback) return error.response;
    return Response.json(
      { message: "Unable to reset your password. Please try again." },
      { status: 503 },
    );
  }
}
