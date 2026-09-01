import { apiClient } from "./client";
import { isRecord, readId, readString } from "./validation";

export interface PaymentAttempt {
  paymentId: string;
  authorizationUrl?: string;
}

export interface PaymentStatusRecord {
  id: string;
  subjectType: string;
  subjectId: string;
  status: string;
  amount: number;
  currency?: string;
}

function normalizePaymentAttempt(value: unknown): PaymentAttempt {
  const item = isRecord(value) ? value : {};
  return {
    paymentId: readId(item.paymentId),
    authorizationUrl: readString(item.authorizationUrl) || undefined,
  };
}

function normalizePaymentStatus(value: unknown): PaymentStatusRecord {
  const item = isRecord(value) ? value : {};
  return {
    id: readId(item._id ?? item.id),
    subjectType: readString(item.subjectType),
    subjectId: readId(item.subjectId),
    status: readString(item.status, "pending"),
    amount: typeof item.amount === "number" ? item.amount : 0,
    currency: readString(item.currency) || undefined,
  };
}

export async function initiateOrderPayment(orderId: string, email: string, idempotencyKey: string): Promise<PaymentAttempt> {
  const data = await apiClient.post<unknown>("/payments/initiate", {
    body: { subjectType: "order", subjectId: orderId, email },
    idempotencyKey,
  });
  return normalizePaymentAttempt(data);
}

export async function fetchPaymentStatus(paymentId: string): Promise<PaymentStatusRecord> {
  return normalizePaymentStatus(await apiClient.get<unknown>("/payments/" + encodeURIComponent(paymentId)));
}
