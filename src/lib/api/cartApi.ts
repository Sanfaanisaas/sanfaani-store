import { apiClient } from "./client";
import { normalizeCart, type NormalizedCart } from "./normalizers/cartNormalizer";

export interface GuestCartEntry {
  variantId: string;
  quantity: number;
}

export async function fetchCart(): Promise<NormalizedCart> {
  return normalizeCart(await apiClient.get<unknown>("/cart"));
}

export async function addCartItem(body: { productId: string; variantSku: string; quantity: number }, idempotencyKey?: string): Promise<NormalizedCart> {
  return normalizeCart(await apiClient.post<unknown>("/cart/items", { body, idempotencyKey }));
}

export async function setCartItemQuantity(variantSku: string, quantity: number, idempotencyKey?: string): Promise<NormalizedCart> {
  return normalizeCart(await apiClient.patch<unknown>("/cart/items/" + encodeURIComponent(variantSku), { body: { quantity }, idempotencyKey }));
}

export async function removeCartItem(variantSku: string, idempotencyKey?: string): Promise<NormalizedCart> {
  return normalizeCart(await apiClient.delete<unknown>("/cart/items/" + encodeURIComponent(variantSku), { idempotencyKey }));
}

export async function mergeGuestCart(guestItems: GuestCartEntry[], idempotencyKey?: string): Promise<NormalizedCart> {
  return normalizeCart(await apiClient.post<unknown>("/cart/merge", { body: { guestItems }, idempotencyKey }));
}
