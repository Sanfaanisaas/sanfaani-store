import type { OrderStatus, PaymentStatus } from "../contracts";
import { ORDER_STATUS, PAYMENT_STATUS } from "../contracts";
import { isRecord, readArray, readId, readNumber, readString } from "../validation";

export interface NormalizedOrderItem {
  productId: string;
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
}

export interface NormalizedShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface NormalizedOrder {
  id: string;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  paymentMethod: string;
  items: NormalizedOrderItem[];
  shippingAddress?: NormalizedShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  receiptUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const orderStatuses = new Set<string>(ORDER_STATUS);
const paymentStatuses = new Set<string>(PAYMENT_STATUS);

function readStatus(value: unknown): string {
  const status = readString(value, "unknown");
  return orderStatuses.has(status) ? status : status;
}

function readPaymentStatus(value: unknown): string {
  const status = readString(value, "pending");
  return paymentStatuses.has(status) ? status : status;
}

function normalizeOrderItem(value: unknown): NormalizedOrderItem {
  const item = isRecord(value) ? value : {};
  return {
    productId: readId(item.productId),
    variantSku: readString(item.variantSku),
    name: readString(item.nameSnapshot ?? item.name, "Item"),
    price: readNumber(item.priceSnapshot ?? item.price),
    quantity: Math.max(1, Math.floor(readNumber(item.quantity, 1))),
  };
}

function normalizeAddress(value: unknown): NormalizedShippingAddress | undefined {
  if (!isRecord(value)) return undefined;
  const street = readString(value.street);
  const city = readString(value.city);
  const state = readString(value.state);
  const country = readString(value.country);
  if (!street || !city || !state || !country) return undefined;
  const postalCode = readString(value.postalCode);
  return { street, city, state, country, ...(postalCode ? { postalCode } : {}) };
}

export function normalizeOrder(value: unknown): NormalizedOrder {
  const item = isRecord(value) ? value : {};
  const id = readId(item.id ?? item._id);
  if (!id) throw new Error("Order response is missing an identifier");

  return {
    id,
    status: readStatus(item.status),
    paymentStatus: readPaymentStatus(item.paymentStatus),
    paymentMethod: readString(item.paymentMethod),
    items: readArray(item.items).map(normalizeOrderItem),
    shippingAddress: normalizeAddress(item.shippingAddress),
    subtotal: readNumber(item.subtotal),
    tax: readNumber(item.tax),
    shippingCost: readNumber(item.shippingCost),
    total: readNumber(item.total),
    receiptUrl: typeof item.receiptUrl === "string" ? item.receiptUrl : item.receiptUrl === null ? null : undefined,
    createdAt: readString(item.createdAt) || undefined,
    updatedAt: readString(item.updatedAt) || undefined,
  };
}

export function normalizeOrderList(value: unknown): { orders: NormalizedOrder[]; totalCount: number; page: number; totalPages: number } {
  const root = isRecord(value) ? value : {};
  const orders = readArray(root.orders ?? (Array.isArray(value) ? value : [])).map(normalizeOrder);
  return {
    orders,
    totalCount: readNumber(root.totalCount, orders.length),
    page: readNumber(root.page, 1),
    totalPages: readNumber(root.totalPages, 1),
  };
}

export function buildOrderTimeline(order: NormalizedOrder): Array<{ label: string; at?: string; detail?: string }> {
  const events: Array<{ label: string; at?: string; detail?: string }> = [];
  if (order.createdAt) events.push({ label: "Order placed", at: order.createdAt });
  if (order.paymentStatus === "pending") events.push({ label: "Payment pending", detail: "Awaiting provider or manual confirmation." });
  if (order.paymentStatus === "paid" || order.paymentStatus === "confirmed") events.push({ label: "Payment confirmed", at: order.updatedAt });
  if (order.paymentStatus === "failed") events.push({ label: "Payment failed", detail: "Retry payment from your order details." });
  if (order.status === "ready_for_pickup") events.push({ label: "Ready for pickup", at: order.updatedAt });
  if (order.status === "dispatched") events.push({ label: "Dispatched", at: order.updatedAt });
  if (order.status === "delivered" || order.status === "completed") events.push({ label: "Fulfilment completed", at: order.updatedAt });
  if (order.status === "cancelled") events.push({ label: "Order cancelled", at: order.updatedAt });
  return events;
}

export function canCancelOrder(order: NormalizedOrder): boolean {
  return !["cancelled", "dispatched", "delivered", "completed", "returned", "refunded"].includes(order.status);
}

export function canRequestRefund(order: NormalizedOrder): boolean {
  return order.paymentStatus === "paid" && ["cancelled", "returned"].includes(order.status);
}
