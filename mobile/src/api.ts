import * as SecureStore from "expo-secure-store";
import type { AuthSession, PublicProduct, PublicRepairTracking } from "../../src/lib/api/contracts";
const ACCESS_TOKEN_KEY = "sanfaani.mobile.access-token";
const baseUrl = (process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000/api").replace(/\/+$/, "");
export class MobileApiError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export async function getAccessToken() { return SecureStore.getItemAsync(ACCESS_TOKEN_KEY); }
export async function saveAccessToken(token: string) { return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }); }
export async function clearAccessToken() { return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY); }
async function request<T>(path: string, init: RequestInit = {}): Promise<T> { const token = await getAccessToken(); const headers = new Headers(init.headers); headers.set("accept", "application/json"); if (token) headers.set("authorization", "Bearer " + token); const response = await fetch(baseUrl + path, { ...init, headers }); const body: unknown = await response.json().catch(() => null); if (!response.ok) throw new MobileApiError(response.status, response.status >= 500 ? "The service is unavailable." : "We could not complete that request."); if (!body || typeof body !== "object" || !("data" in body)) throw new MobileApiError(0, "The service returned an unexpected response."); return (body as { data: T }).data; }
export async function login(email: string, password: string) { const session = await request<AuthSession>("/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) }); await saveAccessToken(session.accessToken); return session.user; }
export async function logout() { try { await request("/auth/logout", { method: "POST" }); } finally { await clearAccessToken(); } }
export const listProducts = () => request<{ products: PublicProduct[] }>("/products");
export const listOrders = () => request<unknown[]>("/orders/mine");
export const trackRepair = (id: string) => request<PublicRepairTracking>("/repairs/" + encodeURIComponent(id) + "/track");
export const createCheckout = (body: object, idempotencyKey: string) => request<unknown>("/checkout", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": idempotencyKey }, body: JSON.stringify(body) });
