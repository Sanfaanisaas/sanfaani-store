import { apiClient, getRuntimeAccessToken } from "./client";
import { normalizeOrder, normalizeOrderList, type NormalizedOrder } from "./normalizers/orderNormalizer";

export async function fetchMyOrders(page = 1, limit = 20) {
  return normalizeOrderList(await apiClient.get<unknown>("/orders/mine?page=" + page + "&limit=" + limit));
}

export async function fetchOrderById(orderId: string): Promise<NormalizedOrder | null> {
  let page = 1;
  const limit = 50;
  while (page <= 10) {
    const result = await fetchMyOrders(page, limit);
    const match = result.orders.find((order) => order.id === orderId);
    if (match) return match;
    if (page >= result.totalPages) break;
    page += 1;
  }
  return null;
}

export async function cancelOrder(orderId: string, idempotencyKey?: string): Promise<NormalizedOrder> {
  return normalizeOrder(await apiClient.patch<unknown>("/orders/" + encodeURIComponent(orderId) + "/cancel", { idempotencyKey }));
}

export async function checkPickupEligibility(total: number, shippingAddress: { city: string; state?: string; country?: string }) {
  const params = new URLSearchParams({ total: String(total), shippingAddress: JSON.stringify(shippingAddress) });
  return apiClient.get<{ eligible: boolean; message?: string }>("/orders/eligible-pickup?" + params.toString());
}

export async function uploadOrderReceipt(orderId: string, file: File, idempotencyKey?: string): Promise<NormalizedOrder> {
  const body = new FormData();
  body.append("receipt", file);
  return normalizeOrder(await apiClient.post<unknown>("/orders/" + encodeURIComponent(orderId) + "/upload-receipt", { body, idempotencyKey }));
}

export async function downloadOrderReceipt(orderId: string): Promise<Blob> {
  const base = typeof window !== "undefined" ? "/api" : (process.env.BACKEND_URL?.replace(/\/+$/, "") ?? "") + "/api";
  const headers: HeadersInit = { accept: "application/pdf" };
  const token = getRuntimeAccessToken();
  if (token) headers.authorization = "Bearer " + token;
  const response = await fetch(base + "/orders/" + encodeURIComponent(orderId) + "/receipt", {
    method: "GET",
    credentials: "include",
    headers,
  });
  if (!response.ok) throw new Error("Receipt is unavailable.");
  return response.blob();
}
