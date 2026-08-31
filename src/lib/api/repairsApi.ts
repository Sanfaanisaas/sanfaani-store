import { apiClient } from "./client";
import type { PublicQuote, PublicRepairTracking, QuoteStatus, RepairStatus } from "./contracts";

export interface RepairRequestPayload {
  device: { type: string; brand: string; model: string; serialNumber?: string };
  issueDescription: string;
  privacyAcknowledged: true;
}

export interface CreatedRepair {
  repairId: string;
  trackingToken: string;
  trackingTokenExpiresAt: string;
}

const repairStatuses: readonly string[] = ["REQUESTED", "INTAKE_PENDING", "INTAKE_SCHEDULED", "RECEIVED", "IN_CUSTODY", "DIAGNOSING", "QUOTE_PENDING", "QUOTE_SENT", "AWAITING_APPROVAL", "APPROVED", "AWAITING_PARTS", "IN_REPAIR", "PAUSED", "QC_PENDING", "QC", "READY", "READY_FOR_PICKUP", "HANDED_OVER", "COMPLETED", "DECLINED", "CANCELLED"];
const quoteStatuses: readonly string[] = ["SENT", "VIEWED", "ACCEPTED", "DECLINED", "EXPIRED"];
const runtimeTrackingTokens = new Map<string, string>();

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Unexpected API response");
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, message: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(message);
  return value;
}

function requiredInteger(value: unknown, message: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(message);
  return value as number;
}

function normalizeQuote(value: unknown): PublicQuote {
  const item = record(value);
  const status = requiredText(item.status, "Quote status is missing");
  if (!quoteStatuses.includes(status)) throw new Error("Quote status is unavailable");
  if (!Array.isArray(item.lineItems)) throw new Error("Quote line items are unavailable");

  return {
    id: requiredText(item.id ?? item._id, "Quote reference is missing"),
    version: requiredInteger(item.version, "Quote version is missing"),
    lineItems: item.lineItems.map((line) => {
      const lineItem = record(line);
      return { description: requiredText(lineItem.description, "Quote line item is unavailable"), amount: requiredInteger(lineItem.amount, "Quote amount is unavailable") };
    }),
    totalAmount: requiredInteger(item.totalAmount, "Quote total is unavailable"),
    estimatedDays: requiredInteger(item.estimatedDays, "Quote estimate is unavailable"),
    status: status as QuoteStatus,
  };
}

export function normalizeRepairTracking(value: unknown): PublicRepairTracking {
  const item = record(value);
  const status = requiredText(item.status, "Repair status is missing");
  if (!repairStatuses.includes(status)) throw new Error("Repair status is unavailable");
  const quote = item.quote === null || item.quote === undefined ? null : normalizeQuote(item.quote);
  return { id: requiredText(item.id ?? item._id, "Repair reference is missing"), status: status as RepairStatus, nextAction: requiredText(item.nextAction, "Repair next action is unavailable"), updatedAt: requiredText(item.updatedAt, "Repair update time is unavailable"), quote };
}

export async function createRepair(payload: RepairRequestPayload): Promise<CreatedRepair> {
  const response = record(await apiClient.post<unknown>("/repairs", { body: payload }));
  const repair = record(response.repair);
  return { repairId: requiredText(repair.id ?? repair._id, "Repair reference is missing"), trackingToken: requiredText(response.trackingToken, "Tracking credential is unavailable"), trackingTokenExpiresAt: requiredText(response.trackingTokenExpiresAt, "Tracking credential expiry is unavailable") };
}

/** Runtime-only credential storage: never URL, cookie, sessionStorage, or localStorage. */
export function rememberTrackingToken(repairId: string, token: string) { runtimeTrackingTokens.set(repairId, token); }
export function runtimeTrackingToken(repairId: string) { return runtimeTrackingTokens.get(repairId) ?? null; }
export function clearRuntimeTrackingToken(repairId: string) { runtimeTrackingTokens.delete(repairId); }

export async function fetchRepairTracking(repairId: string, trackingToken?: string | null) {
  const result = await apiClient.get<unknown>("/repairs/" + encodeURIComponent(repairId) + "/track", trackingToken ? { headers: { "X-Repair-Tracking-Token": trackingToken } } : undefined);
  return normalizeRepairTracking(result);
}

export async function decideRepairQuote({ repairId, quoteId, decision, reason }: { repairId: string; quoteId: string; decision: "approve" | "decline"; reason?: string }) {
  const body = decision === "decline" && reason?.trim() ? { reason: reason.trim() } : undefined;
  return apiClient.patch<unknown>("/repairs/" + encodeURIComponent(repairId) + "/quote/" + encodeURIComponent(quoteId) + "/" + decision, body ? { body } : undefined);
}
