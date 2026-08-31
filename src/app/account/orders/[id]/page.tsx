"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Truck,
  Store,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  XCircle,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient, errorMessage } from "@/lib/api/client";
import { ErrorState, LoadingState } from "@/components/ApiState";
import { formatPrice } from "@/lib/formatPrice";

interface OrderLineItem {
  sku?: string;
  name: string;
  price: number;
  quantity: number;
}

interface FulfilmentEvidence {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  riderName?: string;
  riderPhone?: string;
  dispatchTime?: string;
  deliveredTime?: string;
  pickupCode?: string;
  pickupReadyTime?: string;
  failureReason?: string;
}

interface OrderDetail {
  id: string;
  orderNumber?: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "dispatched"
    | "ready_for_pickup"
    | "delivered"
    | "collected"
    | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  fulfilmentMode: "delivery" | "pickup";
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  pickupLocation?: string;
  items: OrderLineItem[];
  subtotal?: number;
  deliveryFee: number;
  totalAmount: number;
  evidence?: FulfilmentEvidence;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeOrderDetail(value: unknown): OrderDetail {
  const item = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;

  const rawItems = Array.isArray(item.items) ? item.items : [];
  const normalizedItems: OrderLineItem[] = rawItems.map((ri) => {
    const rawObj = (ri && typeof ri === "object" ? ri : {}) as Record<
      string,
      unknown
    >;
    return {
      sku: typeof rawObj.sku === "string" ? rawObj.sku : undefined,
      name: String(rawObj.name || rawObj.title || "Sanfaani Item"),
      price: Number(rawObj.price) || 0,
      quantity: Math.max(1, Number(rawObj.quantity) || 1),
    };
  });

  const rawEvidence = (item.evidence ||
    item.fulfilmentEvidence ||
    {}) as Record<string, unknown>;

  const total =
    typeof item.totalAmount === "number"
      ? item.totalAmount
      : typeof item.total === "number"
        ? item.total
        : normalizedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return {
    id: String(item.id ?? item._id ?? ""),
    orderNumber:
      typeof item.orderNumber === "string" ? item.orderNumber : undefined,
    status: (typeof item.status === "string"
      ? item.status
      : "pending") as OrderDetail["status"],
    paymentStatus: (typeof item.paymentStatus === "string"
      ? item.paymentStatus
      : typeof item.isPaid === "boolean"
        ? item.isPaid
          ? "paid"
          : "pending"
        : "pending") as OrderDetail["paymentStatus"],
    paymentMethod:
      typeof item.paymentMethod === "string" ? item.paymentMethod : undefined,
    fulfilmentMode: item.fulfilmentMode === "pickup" ? "pickup" : "delivery",
    shippingAddress:
      item.shippingAddress && typeof item.shippingAddress === "object"
        ? (item.shippingAddress as OrderDetail["shippingAddress"])
        : undefined,
    pickupLocation:
      typeof item.pickupLocation === "string" ? item.pickupLocation : undefined,
    items: normalizedItems,
    subtotal: typeof item.subtotal === "number" ? item.subtotal : undefined,
    deliveryFee: typeof item.deliveryFee === "number" ? item.deliveryFee : 0,
    totalAmount: total,
    evidence: {
      carrier:
        typeof rawEvidence.carrier === "string"
          ? rawEvidence.carrier
          : undefined,
      trackingNumber:
        typeof rawEvidence.trackingNumber === "string"
          ? rawEvidence.trackingNumber
          : undefined,
      trackingUrl:
        typeof rawEvidence.trackingUrl === "string"
          ? rawEvidence.trackingUrl
          : undefined,
      riderName:
        typeof rawEvidence.riderName === "string"
          ? rawEvidence.riderName
          : undefined,
      riderPhone:
        typeof rawEvidence.riderPhone === "string"
          ? rawEvidence.riderPhone
          : undefined,
      dispatchTime:
        typeof rawEvidence.dispatchTime === "string"
          ? rawEvidence.dispatchTime
          : undefined,
      deliveredTime:
        typeof rawEvidence.deliveredTime === "string"
          ? rawEvidence.deliveredTime
          : undefined,
      pickupCode:
        typeof rawEvidence.pickupCode === "string"
          ? rawEvidence.pickupCode
          : undefined,
      pickupReadyTime:
        typeof rawEvidence.pickupReadyTime === "string"
          ? rawEvidence.pickupReadyTime
          : undefined,
      failureReason:
        typeof rawEvidence.failureReason === "string"
          ? rawEvidence.failureReason
          : undefined,
    },
    cancellationReason:
      typeof item.cancellationReason === "string"
        ? item.cancellationReason
        : undefined,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessageState, setErrorMessageState] = useState(
    "Order details are unavailable.",
  );

  // Cancellation modal state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await apiClient.get<unknown>(
        `/orders/${encodeURIComponent(id)}`,
      );
      setOrder(normalizeOrderDetail(data));
      setState("ready");
    } catch (err) {
      setErrorMessageState(
        errorMessage(err, "We could not locate this order."),
      );
      setState("error");
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!ignore) {
        await loadOrder();
      }
    };
    void run();
    return () => {
      ignore = true;
    };
  }, [loadOrder]);

  async function handleCancelOrder() {
    if (!order) return;
    setIsCancelling(true);
    setActionFeedback(null);

    try {
      await apiClient.post<unknown>(
        `/orders/${encodeURIComponent(order.id)}/cancel`,
        {
          body: { reason: cancelReason || "Customer requested cancellation" },
        },
      );
      setCancelModalOpen(false);
      setActionFeedback("Order cancelled successfully.");
      await loadOrder();
    } catch (err) {
      setActionFeedback(
        errorMessage(
          err,
          "Unable to cancel this order. It may have already been dispatched.",
        ),
      );
    } finally {
      setIsCancelling(false);
    }
  }

  if (state === "loading") {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-16">
          <LoadingState>Loading order and tracking details…</LoadingState>
        </main>
      </>
    );
  }

  if (state === "error" || !order) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-16">
          <ErrorState
            message={errorMessageState}
            onRetry={() => void loadOrder()}
          />
          <div className="mt-4 text-center">
            <Link
              href="/account/orders"
              className="text-sm font-semibold text-blue underline"
            >
              ← Return to My Orders
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Timeline stage calculation
  const isCancelled = order.status === "cancelled";
  const isPaid = order.paymentStatus === "paid";

  const timelineSteps = [
    {
      id: "placed",
      title: "Order Placed",
      desc: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-NG", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recorded",
      isComplete: true,
    },
    {
      id: "payment",
      title: "Payment Confirmed",
      desc: isPaid ? "Paid in full" : "Awaiting verification",
      isComplete: isPaid || order.status !== "pending",
    },
    {
      id: "processing",
      title: "Quality Check & Packing",
      desc: "Device testing & sealed packaging",
      isComplete: [
        "processing",
        "dispatched",
        "ready_for_pickup",
        "delivered",
        "collected",
      ].includes(order.status),
    },
    {
      id: "transit",
      title:
        order.fulfilmentMode === "pickup"
          ? "Ready for Store Pickup"
          : "Dispatched for Delivery",
      desc:
        order.fulfilmentMode === "pickup"
          ? order.evidence?.pickupReadyTime
            ? `Ready since ${new Date(order.evidence.pickupReadyTime).toLocaleDateString()}`
            : "Available at main branch"
          : order.evidence?.carrier
            ? `Via ${order.evidence.carrier}`
            : "En route",
      isComplete: [
        "dispatched",
        "ready_for_pickup",
        "delivered",
        "collected",
      ].includes(order.status),
    },
    {
      id: "completed",
      title: order.fulfilmentMode === "pickup" ? "Collected" : "Delivered",
      desc:
        order.status === "delivered" || order.status === "collected"
          ? "Fulfilment verified"
          : "Pending receipt",
      isComplete: order.status === "delivered" || order.status === "collected",
    },
  ];

  // Cancellation eligibility (allow cancellation only prior to dispatch/collection)
  const isCancellable =
    !isCancelled &&
    order.status !== "dispatched" &&
    order.status !== "ready_for_pickup" &&
    order.status !== "delivered" &&
    order.status !== "collected";

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="mx-auto max-w-4xl px-6 py-10 min-h-screen"
      >
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mist hover:text-navy-900"
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/20 px-3.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-900/5"
          >
            <Printer size={13} /> Print Invoice
          </button>
        </div>

        {actionFeedback && (
          <div
            role="status"
            className="mb-6 rounded-2xl bg-paper border border-navy-900/10 p-4 text-sm font-medium text-navy-900"
          >
            {actionFeedback}
          </div>
        )}

        {/* Order Header Card */}
        <div className="rounded-3xl border border-navy-900/10 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-900/10 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mist">
                Order Tracking & Receipt
              </span>
              <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold text-ink">
                Order #{order.orderNumber || order.id}
              </h1>
              <p className="mt-1 text-xs text-mist">
                Placed on{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-NG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Recently"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  isCancelled
                    ? "bg-red-50 text-red-700"
                    : order.status === "delivered" ||
                        order.status === "collected"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-navy-900 text-white"
                }`}
              >
                {order.status.replaceAll("_", " ")}
              </span>

              <span className="text-xs text-mist">
                Payment:{" "}
                <strong className="text-ink uppercase font-semibold">
                  {order.paymentStatus || "Pending"}
                </strong>
              </span>
            </div>
          </div>

          {/* Cancellation State Alert */}
          {isCancelled && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-900">
              <div className="flex items-start gap-2.5">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <strong className="block font-semibold">
                    This order was cancelled.
                  </strong>
                  <p className="text-xs mt-0.5 text-red-800">
                    Reason:{" "}
                    {order.cancellationReason ||
                      "Customer cancellation requested."}
                  </p>
                  {isPaid && (
                    <p className="text-xs mt-2 font-medium text-red-900 bg-red-100/60 p-2.5 rounded-xl">
                      Refund Policy Notice: Because payment was confirmed, your
                      refund will automatically credit to your original payment
                      method within 3 to 5 business days.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Facing Timeline */}
          {!isCancelled && (
            <section className="mt-8" aria-label="Fulfilment timeline">
              <h2 className="text-xs font-bold uppercase tracking-wider text-mist">
                Fulfilment Timeline
              </h2>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                {timelineSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`relative rounded-2xl border p-4 transition ${
                      step.isComplete
                        ? "border-navy-900/20 bg-paper"
                        : "border-navy-900/5 bg-white opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          step.isComplete
                            ? "bg-navy-900 text-white"
                            : "bg-navy-900/10 text-mist"
                        }`}
                      >
                        {step.isComplete ? <CheckCircle2 size={14} /> : idx + 1}
                      </div>
                      <h3 className="text-xs font-bold text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-[11px] text-mist leading-tight">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fulfilment Evidence & Dynamic Next Action Card */}
          <section className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* Fulfilment Information */}
            <div className="rounded-2xl border border-navy-900/10 bg-paper p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                {order.fulfilmentMode === "pickup" ? (
                  <Store size={16} />
                ) : (
                  <Truck size={16} />
                )}
                {order.fulfilmentMode === "pickup"
                  ? "Store Pickup Details"
                  : "Delivery & Tracking Details"}
              </h2>

              {order.fulfilmentMode === "pickup" ? (
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-ink">
                    {order.pickupLocation || "Sanfaani Store — Main Branch"}
                  </p>
                  <p className="text-mist">
                    Plot 4, Commercial Avenue, Lagos, Nigeria
                  </p>
                  <p className="text-mist">
                    Operating Hours: Mon - Sat (9:00 AM - 6:00 PM)
                  </p>

                  {order.evidence?.pickupCode && (
                    <div className="mt-3 rounded-xl bg-white border border-navy-900/10 p-3 text-center">
                      <span className="text-[11px] text-mist block">
                        Collection PIN / Code
                      </span>
                      <strong className="font-mono text-base tracking-widest text-navy-900">
                        {order.evidence.pickupCode}
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-mist">
                    Destination:{" "}
                    <strong className="text-ink">
                      {order.shippingAddress?.street},{" "}
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}
                    </strong>
                  </p>
                  {order.evidence?.carrier && (
                    <p className="text-mist">
                      Carrier:{" "}
                      <strong className="text-ink">
                        {order.evidence.carrier}
                      </strong>
                    </p>
                  )}
                  {order.evidence?.trackingNumber && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-white p-2.5 border border-navy-900/10">
                      <span className="font-mono">
                        {order.evidence.trackingNumber}
                      </span>
                      {order.evidence.trackingUrl && (
                        <a
                          href={order.evidence.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue underline"
                        >
                          Track on carrier <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Dispatch Failure Alert */}
                  {order.evidence?.failureReason && (
                    <div className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-800 border border-red-200 flex items-start gap-2">
                      <AlertTriangle
                        size={14}
                        className="mt-0.5 shrink-0 text-red-600"
                      />
                      <div>
                        <strong>Delivery Attempt Issue:</strong>{" "}
                        {order.evidence.failureReason}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Next Action & Support Card */}
            <div className="rounded-2xl border border-navy-900/10 bg-paper p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                  <HelpCircle size={16} /> Customer Action & Support
                </h2>
                <p className="mt-2 text-xs text-mist leading-relaxed">
                  {order.status === "ready_for_pickup"
                    ? "Your order is prepared at the counter. Please present your Collection PIN and a valid photo ID upon arrival."
                    : order.status === "dispatched"
                      ? "Your package is currently in transit with our logistics partner. Keep your phone available for rider contact."
                      : order.status === "delivered" ||
                          order.status === "collected"
                        ? "Fulfilment complete. All Sanfaani refurbished products include active warranty coverage."
                        : "Our engineers are conducting device diagnostics and preparing your shipment."}
                </p>
              </div>

              {isCancellable && (
                <div className="mt-4 pt-3 border-t border-navy-900/10">
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                  >
                    Request Order Cancellation
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Immutable Items & Invoice Breakdown */}
          <section className="mt-8 border-t border-navy-900/10 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <FileText size={16} /> Invoice Breakdown
              </h2>
            </div>

            <div className="mt-4 divide-y divide-navy-900/5">
              {order.items.map((item, idx) => (
                <div
                  key={item.sku ? `${item.sku}-${idx}` : `${item.name}-${idx}`}
                  className="py-3 flex justify-between items-center text-sm"
                >
                  <div>
                    <strong className="text-ink font-semibold">
                      {item.name}
                    </strong>
                    {item.sku && (
                      <span className="text-xs text-mist block font-mono">
                        SKU: {item.sku}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-mist mr-3">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                    <strong className="font-semibold text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 rounded-2xl bg-paper p-4 text-sm">
              <div className="flex justify-between text-mist text-xs">
                <span>Payment Method:</span>
                <span className="capitalize text-ink font-medium">
                  {order.paymentMethod?.replaceAll("_", " ") || "Paystack"}
                </span>
              </div>
              <div className="flex justify-between text-mist text-xs">
                <span>Delivery / Logistics Fee:</span>
                <span className="text-ink font-medium">
                  {order.deliveryFee ? formatPrice(order.deliveryFee) : "FREE"}
                </span>
              </div>
              <div className="flex justify-between border-t border-navy-900/10 pt-2 font-bold text-ink text-base">
                <span>Grand Total Paid:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Cancellation Confirmation Modal */}
        {cancelModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4"
          >
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-ink">
                Cancel Order #{order.orderNumber || order.id}?
              </h2>
              <p className="mt-2 text-xs text-mist leading-relaxed">
                Orders can only be cancelled prior to dispatch. If you have
                already paid, your funds will be refunded to your source payment
                method within 3-5 business days.
              </p>

              <label className="mt-4 block text-xs font-semibold text-ink">
                Reason for cancellation (optional)
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed mind, selected wrong model..."
                  className="mt-1.5 w-full rounded-xl border border-navy-900/20 p-2.5 text-xs focus:border-navy-900 focus:outline-none"
                />
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-full border border-navy-900/20 px-4 py-2 text-xs font-semibold text-ink hover:bg-navy-900/5 disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => void handleCancelOrder()}
                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling…" : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
