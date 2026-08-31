import { apiClient } from "./client";

export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";
export interface CustomerMessage {
  body: string;
  createdAt?: string;
}
export interface CustomerTicket {
  id: string;
  subject: string;
  status: SupportStatus;
  createdAt?: string;
  updatedAt?: string;
  messages: CustomerMessage[];
}
const statuses: readonly string[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
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
function id(value: unknown): string {
  const result = text(value);
  if (!result) throw new Error("Ticket reference is missing");
  return result;
}
export function normalizeTicket(value: unknown): CustomerTicket {
  const item = record(value);
  const status = text(item.status);
  if (!statuses.includes(status))
    throw new Error("Ticket status is unavailable");
  return {
    id: id(item.id ?? item._id),
    subject: text(item.subject) || "Support request",
    status: status as SupportStatus,
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
    messages: Array.isArray(item.messages)
      ? item.messages.flatMap((entry) => {
          const message = record(entry);
          const body = text(message.body);
          return body ? [{ body, createdAt: date(message.createdAt) }] : [];
        })
      : [],
  };
}
export async function listMyTickets() {
  const response = await apiClient.get<unknown>("/support-tickets/mine");
  return (Array.isArray(response) ? response : []).map(normalizeTicket);
}
export async function createSupportTicket(subject: string, message: string) {
  return apiClient.post<unknown>("/support-tickets", {
    body: { subject: subject.trim(), message: message.trim() },
  });
}
export async function replyToTicket(ticketId: string, body: string) {
  return apiClient.post<unknown>(
    "/support-tickets/" + encodeURIComponent(ticketId) + "/reply",
    { body: { body: body.trim() } },
  );
}
