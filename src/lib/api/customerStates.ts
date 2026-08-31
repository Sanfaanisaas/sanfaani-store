import { ApiError } from "./client";

/** Maps normalized transport failures to customer-safe, actionable copy. */
export function customerApiMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return fallback;

  switch (error.kind) {
    case "unauthorized": return "Please sign in to continue.";
    case "forbidden": return "Your account cannot perform that action.";
    case "not_found": return "This record is unavailable.";
    case "conflict": return "This record changed before your request could be completed. Refresh and try again.";
    case "validation": return "Please review the highlighted information and try again.";
    case "rate_limited": return "Too many requests were made. Please wait before trying again.";
    case "unavailable": return "The service is temporarily unavailable. Please try again.";
    case "network":
    case "timeout": return "We could not reach the service. Check your connection and try again.";
    default: return fallback;
  }
}

export function fieldErrors(error: unknown) {
  return error instanceof ApiError ? error.fieldErrors : {};
}
