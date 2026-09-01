import { apiClient } from "./client";
import { normalizeOrder, type NormalizedOrder } from "./normalizers/orderNormalizer";

export type CheckoutPaymentMethod = "paystack" | "bank_transfer" | "pay_on_pickup";

export interface CheckoutAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface CheckoutRequest {
  paymentMethod: CheckoutPaymentMethod;
  shippingAddress: CheckoutAddress;
}

export async function createCheckout(request: CheckoutRequest, idempotencyKey: string): Promise<NormalizedOrder> {
  return normalizeOrder(await apiClient.post<unknown>("/checkout", { body: request, idempotencyKey }));
}
