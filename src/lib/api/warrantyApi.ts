import { apiClient } from "./client";

export type ClaimStatus =
  | "submitted"
  | "screening"
  | "inspection_required"
  | "under_inspection"
  | "approved"
  | "rejected"
  | "remedy_in_progress"
  | "resolved"
  | "closed"
  | "cancelled";
export type ReturnStatus =
  | "SUBMITTED"
  | "INSPECTION_REQUIRED"
  | "UNDER_INSPECTION"
  | "APPROVED"
  | "REJECTED"
  | "REMEDY_IN_PROGRESS"
  | "RESOLVED"
  | "CANCELLED";
export type ReturnRemedy =
  | "repair"
  | "replacement"
  | "refund"
  | "store_credit"
  | null;
export interface CustomerClaim {
  id: string;
  warrantyId: string;
  description: string;
  status: ClaimStatus;
  createdAt?: string;
  updatedAt?: string;
}
export interface ReturnRequest {
  id: string;
  status: ReturnStatus;
  remedy: ReturnRemedy;
  createdAt?: string;
  updatedAt?: string;
  items: Array<{ variantSku: string; quantity: number }>;
}
export interface ReturnOrder {
  id: string;
  items: Array<{ variantSku: string; name: string; quantity: number }>;
  createdAt?: string;
}

const claimStatuses: readonly string[] = [
  "submitted",
  "screening",
  "inspection_required",
  "under_inspection",
  "approved",
  "rejected",
  "remedy_in_progress",
  "resolved",
  "closed",
  "cancelled",
];
const returnStatuses: readonly string[] = [
  "SUBMITTED",
  "INSPECTION_REQUIRED",
  "UNDER_INSPECTION",
  "APPROVED",
  "REJECTED",
  "REMEDY_IN_PROGRESS",
  "RESOLVED",
  "CANCELLED",
];
const remedies: readonly string[] = [
  "repair",
  "replacement",
  "refund",
  "store_credit",
];
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected API response");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function date(value: unknown): string | undefined {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? value
    : undefined;
}
function integer(value: unknown): number | null {
  return Number.isSafeInteger(value) && (value as number) > 0
    ? (value as number)
    : null;
}
function id(value: unknown): string {
  const result = text(value);
  if (!result) throw new Error("Customer record reference is missing");
  return result;
}
function linkedId(value: unknown): string {
  if (typeof value === "string") return id(value);
  const item = record(value);
  return id(item.id ?? item._id);
}
function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeClaim(value: unknown): CustomerClaim {
  const item = record(value);
  const status = text(item.status);
  if (!claimStatuses.includes(status))
    throw new Error("Claim status is unavailable");
  return {
    id: id(item.id ?? item._id),
    warrantyId: linkedId(item.warranty),
    description: text(item.description),
    status: status as ClaimStatus,
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}
export function normalizeReturn(value: unknown): ReturnRequest {
  const item = record(value);
  const status = text(item.status);
  if (!returnStatuses.includes(status))
    throw new Error("Return status is unavailable");
  const remedy = text(item.remedy);
  return {
    id: id(item.id ?? item._id),
    status: status as ReturnStatus,
    remedy: remedies.includes(remedy) ? (remedy as ReturnRemedy) : null,
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
    items: array(item.items).flatMap((entry) => {
      const line = record(entry);
      const quantity = integer(line.quantity);
      const variantSku = text(line.variantSku);
      return quantity && variantSku ? [{ variantSku, quantity }] : [];
    }),
  };
}
function normalizeOrder(value: unknown): ReturnOrder {
  const item = record(value);
  return {
    id: id(item.id ?? item._id),
    createdAt: date(item.createdAt),
    items: array(item.items).flatMap((entry) => {
      const line = record(entry);
      const quantity = integer(line.quantity);
      const variantSku = text(line.variantSku);
      return quantity && variantSku
        ? [
            {
              variantSku,
              quantity,
              name: text(line.nameSnapshot) || "Order item",
            },
          ]
        : [];
    }),
  };
}
export async function listMyClaims() {
  const result = await apiClient.get<unknown>("/claims/mine");
  return array(result).map(normalizeClaim);
}
export async function listMyReturns() {
  const result = await apiClient.get<unknown>("/returns/mine");
  return array(result).map(normalizeReturn);
}
export async function listReturnOrders() {
  const result = record(await apiClient.get<unknown>("/orders/mine"));
  return array(result.orders).map(normalizeOrder);
}
export async function submitReturn(
  orderId: string,
  items: Array<{ variantSku: string; quantity: number }>,
  reason: string,
) {
  return normalizeReturn(
    await apiClient.post<unknown>(
      "/returns/orders/" + encodeURIComponent(orderId),
      { body: { items, reason: reason.trim() } },
    ),
  );
}
