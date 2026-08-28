import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, apiClient, configureSessionRecovery, setRuntimeAccessToken } from "../../src/lib/api/client";
const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; setRuntimeAccessToken(null); configureSessionRecovery({ refresh: async () => false, onExpired: () => undefined }); });
test("normalizes a forbidden envelope without exposing internals", async () => { globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: "Forbidden", errors: [{ path: "role", message: "Forbidden" }] }), { status: 403, headers: { "content-type": "application/json", "x-request-id": "request-1" } }); await assert.rejects(apiClient.get("/private"), (error: unknown) => error instanceof ApiError && error.kind === "forbidden" && error.requestId === "request-1" && error.message === "Forbidden"); });
