import type { ApiEnvelope, ApiFailureEnvelope } from "./contracts";
export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "unavailable"
  | "network"
  | "timeout"
  | "aborted"
  | "unknown";
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly requestId?: string;
  readonly fieldErrors: Record<string, string>;
  readonly retryAfter?: string | null;
  constructor(options: {
    kind: ApiErrorKind;
    message: string;
    status?: number;
    requestId?: string;
    fieldErrors?: Record<string, string>;
    retryAfter?: string | null;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.kind = options.kind;
    this.status = options.status;
    this.requestId = options.requestId;
    this.fieldErrors = options.fieldErrors ?? {};
    this.retryAfter = options.retryAfter;
  }
}
export interface ApiRequestOptions {
  body?: BodyInit | object | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  skipRefresh?: boolean;
  idempotencyKey?: string;
}
let accessToken: string | null = null;
let refreshSession: (() => Promise<boolean>) | null = null;
let clearSession: (() => void) | null = null;
let refreshFlight: Promise<boolean> | null = null;
export function setRuntimeAccessToken(token: string | null) {
  accessToken = token;
}
export function configureSessionRecovery(options: {
  refresh: () => Promise<boolean>;
  onExpired: () => void;
}) {
  refreshSession = options.refresh;
  clearSession = options.onExpired;
}
function apiBaseUrl() {
  if (typeof window !== "undefined") return "/api";
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  return base ? base + "/api" : "/api";
}
function joinSignals(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () =>
      controller.abort(new DOMException("Request timed out", "TimeoutError")),
    timeoutMs,
  );
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
  };
}
function failureFrom(
  status: number,
  body: ApiFailureEnvelope | null,
  response: Response,
) {
  const fields = Object.fromEntries(
    (body?.errors ?? []).flatMap((item) =>
      item.path && item.message ? [[item.path, item.message]] : [],
    ),
  );
  const kind: ApiErrorKind =
    status === 401
      ? "unauthorized"
      : status === 403
        ? "forbidden"
        : status === 404
          ? "not_found"
          : status === 409
            ? "conflict"
            : status === 422 || status === 400
              ? "validation"
              : status === 429
                ? "rate_limited"
                : status >= 500
                  ? "unavailable"
                  : "unknown";
  const message =
    kind === "unavailable"
      ? "The service is temporarily unavailable. Please try again."
      : kind === "rate_limited"
        ? "Too many requests. Please wait before trying again."
        : body?.message || "We could not complete that request.";
  return new ApiError({
    kind,
    message,
    status,
    requestId: response.headers.get("x-request-id") ?? body?.requestId,
    fieldErrors: fields,
    retryAfter: response.headers.get("retry-after"),
  });
}
async function readJson(response: Response): Promise<unknown> {
  if (
    !(response.headers.get("content-type") ?? "").includes("application/json")
  )
    return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}
async function getRefreshResult(): Promise<boolean> {
  if (!refreshSession) return false;
  refreshFlight ??= refreshSession().finally(() => {
    refreshFlight = null;
  });
  return refreshFlight;
}
async function request<T>(
  method: string,
  path: string,
  options: ApiRequestOptions = {},
  retried = false,
): Promise<T> {
  const joined = joinSignals(options.signal, options.timeoutMs ?? 12_000);
  const headers = new Headers(options.headers);
  headers.set("accept", "application/json");
  if (accessToken) headers.set("authorization", "Bearer " + accessToken);
  if (options.idempotencyKey)
    headers.set("idempotency-key", options.idempotencyKey);
  let body: BodyInit | undefined;
  if (
    options.body instanceof FormData ||
    typeof options.body === "string" ||
    options.body instanceof Blob
  )
    body = options.body;
  else if (options.body != null) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(options.body);
  }
  try {
    const response = await fetch(apiBaseUrl() + path, {
      method,
      body,
      headers,
      credentials: "include",
      signal: joined.signal,
    });
    const parsed = (await readJson(response)) as
      | ApiEnvelope<T>
      | ApiFailureEnvelope
      | null;
    if (!response.ok) {
      const error = failureFrom(
        response.status,
        parsed && !parsed.success ? parsed : null,
        response,
      );
      if (
        error.kind === "unauthorized" &&
        !options.skipRefresh &&
        !retried &&
        !joined.signal.aborted
      ) {
        const refreshed = await getRefreshResult();
        if (refreshed && !joined.signal.aborted)
          return request<T>(method, path, options, true);
        clearSession?.();
      }
      throw error;
    }
    if (
      !parsed ||
      !(
        (parsed.success === true ||
          ("status" in parsed && parsed.status === "success")) &&
        "data" in parsed
      )
    )
      throw new ApiError({
        kind: "unknown",
        message: "The service returned an unexpected response.",
      });
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (joined.signal.aborted) {
      const timedOut =
        joined.signal.reason instanceof DOMException &&
        joined.signal.reason.name === "TimeoutError";
      throw new ApiError({
        kind: timedOut ? "timeout" : "aborted",
        message: timedOut
          ? "The request timed out. Please try again."
          : "The request was cancelled.",
      });
    }
    throw new ApiError({
      kind: "network",
      message:
        "We could not reach the service. Check your connection and try again.",
    });
  } finally {
    joined.cleanup();
  }
}
export const apiClient = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>("POST", path, options),
  patch: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>("DELETE", path, options),
};
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  return error instanceof ApiError ? error.message : fallback;
}
