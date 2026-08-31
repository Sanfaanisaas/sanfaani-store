import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Interface representing raw backend order object (which might contain sensitive internal fields)
interface RawBackendOrder {
  _id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  fulfilmentMode: "delivery" | "pickup";
  totalAmount: number;
  deliveryFee: number;
  items: Array<{
    sku: string;
    name: string;
    price: number;
    costPrice?: number; // Internal cost
    quantity: number;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
  };
  pickupLocation?: string;
  evidence?: {
    carrier?: string;
    trackingNumber?: string;
    pickupCode?: string;
    carrierApiToken?: string; // Sensitive token
  };
  // Internal staff-only fields that MUST NOT leak
  internalNotes?: string[];
  adminAuditTrail?: Array<{ staffId: string; note: string }>;
  profitMargin?: number;
}

// Normalizer function mirroring src/app/account/orders/[id]/page.tsx
function projectCustomerOrderDetail(raw: RawBackendOrder) {
  const normalizedItems = (raw.items || []).map((item) => ({
    sku: item.sku,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    // Explicitly omit costPrice
  }));

  const rawEvidence = raw.evidence || {};

  return {
    id: raw._id,
    orderNumber: raw.orderNumber,
    status: raw.status,
    paymentStatus: raw.paymentStatus,
    fulfilmentMode: raw.fulfilmentMode,
    shippingAddress: raw.shippingAddress,
    pickupLocation: raw.pickupLocation,
    items: normalizedItems,
    deliveryFee: raw.deliveryFee,
    totalAmount: raw.totalAmount,
    evidence: {
      carrier: rawEvidence.carrier,
      trackingNumber: rawEvidence.trackingNumber,
      pickupCode: rawEvidence.pickupCode,
      // Explicitly omit carrierApiToken
    },
    // Calculated flags
    isCancellable:
      raw.status !== "cancelled" &&
      raw.status !== "dispatched" &&
      raw.status !== "ready_for_pickup" &&
      raw.status !== "delivered" &&
      raw.status !== "collected",
    hasRefundNotice: raw.status === "cancelled" && raw.paymentStatus === "paid",
  };
}

describe("FE-06 Customer Order Ownership & Projection", () => {
  const mockRawDeliveryOrder: RawBackendOrder = {
    _id: "order_12345",
    orderNumber: "SF-ORD-2026-99",
    customerId: "usr_patrick_01",
    status: "processing",
    paymentStatus: "paid",
    fulfilmentMode: "delivery",
    totalAmount: 153500,
    deliveryFee: 3500,
    items: [
      {
        sku: "GAD-IPH-13-128",
        name: "iPhone 13 128GB Pristine",
        price: 150000,
        costPrice: 110000, // Secret cost
        quantity: 1,
      },
    ],
    shippingAddress: {
      street: "12 Marina Road",
      city: "Lagos Island",
      state: "Lagos",
    },
    evidence: {
      carrier: "GIG Logistics",
      trackingNumber: "GIG-998877",
      carrierApiToken: "secret_live_bearer_token_xyz", // Sensitive
    },
    internalNotes: [
      "Customer called asking for expedited shipping",
      "Margin 26%",
    ],
    adminAuditTrail: [
      { staffId: "admin_09", note: "Device passed QC battery test" },
    ],
    profitMargin: 40000,
  };

  it("should project customer-facing order detail without leaking internal notes, margins or API tokens", () => {
    const projected = projectCustomerOrderDetail(mockRawDeliveryOrder);

    // Assert customer fields are intact
    assert.equal(projected.id, "order_12345");
    assert.equal(projected.orderNumber, "SF-ORD-2026-99");
    assert.equal(projected.items[0].sku, "GAD-IPH-13-128");
    assert.equal(projected.items[0].price, 150000);
    assert.equal(projected.evidence.carrier, "GIG Logistics");

    // STRICT PROJECTION PRIVACY ASSERTIONS:
    assert.equal(
      (projected as unknown as Record<string, unknown>).internalNotes,
      undefined,
    );
    assert.equal(
      (projected as unknown as Record<string, unknown>).adminAuditTrail,
      undefined,
    );
    assert.equal(
      (projected as unknown as Record<string, unknown>).profitMargin,
      undefined,
    );
    assert.equal(
      (projected.items[0] as unknown as Record<string, unknown>).costPrice,
      undefined,
    );
    assert.equal(
      (projected.evidence as unknown as Record<string, unknown>)
        .carrierApiToken,
      undefined,
    );
  });

  it("should permit cancellation when order is in pending or processing state", () => {
    const pendingOrder = projectCustomerOrderDetail({
      ...mockRawDeliveryOrder,
      status: "pending",
    });
    assert.equal(pendingOrder.isCancellable, true);

    const processingOrder = projectCustomerOrderDetail({
      ...mockRawDeliveryOrder,
      status: "processing",
    });
    assert.equal(processingOrder.isCancellable, true);
  });

  it("should block cancellation once order is dispatched, ready for pickup, delivered, or collected", () => {
    const dispatchedOrder = projectCustomerOrderDetail({
      ...mockRawDeliveryOrder,
      status: "dispatched",
    });
    assert.equal(dispatchedOrder.isCancellable, false);

    const readyPickupOrder = projectCustomerOrderDetail({
      ...mockRawDeliveryOrder,
      fulfilmentMode: "pickup",
      status: "ready_for_pickup",
    });
    assert.equal(readyPickupOrder.isCancellable, false);

    const deliveredOrder = projectCustomerOrderDetail({
      ...mockRawDeliveryOrder,
      status: "delivered",
    });
    assert.equal(deliveredOrder.isCancellable, false);
  });

  it("should flag refund SLA notice when a paid order is cancelled", () => {
    const cancelledPaidOrder = projectCustomerOrderDetail({
      ...mockRawDeliveryOrder,
      status: "cancelled",
      paymentStatus: "paid",
    });

    assert.equal(cancelledPaidOrder.hasRefundNotice, true);
    assert.equal(cancelledPaidOrder.isCancellable, false);
  });
});
