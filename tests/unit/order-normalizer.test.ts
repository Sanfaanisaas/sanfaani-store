import assert from "node:assert/strict";
import test from "node:test";
import { buildOrderTimeline, canCancelOrder, normalizeOrder } from "../../src/lib/api/normalizers/orderNormalizer";

test("normalizeOrder maps totals and item snapshots", () => {
  const order = normalizeOrder({
    _id: "order1",
    status: "pending_payment",
    paymentStatus: "pending",
    paymentMethod: "paystack",
    subtotal: 1000,
    tax: 0,
    shippingCost: 200,
    total: 1200,
    items: [{ variantSku: "SKU-1", nameSnapshot: "Phone", priceSnapshot: 1000, quantity: 1 }],
  });
  assert.equal(order.id, "order1");
  assert.equal(order.total, 1200);
  assert.equal(order.items[0]?.name, "Phone");
});

test("timeline and cancellation eligibility use server states", () => {
  const pending = normalizeOrder({ id: "1", status: "pending_payment", paymentStatus: "pending", paymentMethod: "paystack", subtotal: 1, tax: 0, shippingCost: 0, total: 1, items: [] });
  const cancelled = normalizeOrder({ id: "2", status: "cancelled", paymentStatus: "failed", paymentMethod: "paystack", subtotal: 1, tax: 0, shippingCost: 0, total: 1, items: [] });
  assert.equal(canCancelOrder(pending), true);
  assert.equal(canCancelOrder(cancelled), false);
  assert.ok(buildOrderTimeline(pending).some((event) => event.label === "Payment pending"));
});
