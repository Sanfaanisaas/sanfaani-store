"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import {
  Package,
  CreditCard,
  CheckCircle2,
  Circle,
  FileText,
  AlertCircle,
  RefreshCw,
  Truck,
  Store,
  XCircle,
  MapPin,
  Info,
  QrCode,
  Ban,
} from "lucide-react";

import axiosInstance from "@/lib/api/axiosInstance";
import Sidebar from "@/components/sidebar";
import type { RootState } from "@/lib/redux/store";

interface OrderItem {
  productId: string;
  name: string;
  variantSku: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  _id: string;
  id?: string;
  createdAt: string;
  totalAmount: number;
  shippingFee?: number;
  paymentStatus: "paid" | "pending_transfer" | "pay_on_pickup" | "failed";
  status:
    | "order_placed"
    | "payment_confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  fulfilmentMode: "delivery" | "pickup";
  shippingAddress?: ShippingAddress;
  invoiceToken?: string;
  pickupCode?: string;
  trackingNumber?: string;
  isCancellable?: boolean;
  items: OrderItem[];
}

const TIMELINE_STEPS = [
  { key: "order_placed", label: "Order placed" },
  { key: "payment_confirmed", label: "Payment confirmed" },
  { key: "preparing", label: "Preparing your order" },
  { key: "shipped", label: "Shipped / Ready for Pickup" },
  { key: "delivered", label: "Delivered / Handed Over" },
];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  // 1. Fetch live orders from authoritative endpoint
  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);

      try {
        const { data } = await axiosInstance.get<Order[]>("/orders/mine");
        setOrders(data);

        if (data.length > 0) {
          const highlightedOrder = data.find(
            (o) => o._id === highlightId || o.id === highlightId,
          );
          setSelectedOrder(highlightedOrder || data[0]);
        }
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const axiosErr = err as {
            response?: { data?: { message?: string } };
          };
          setError(
            axiosErr.response?.data?.message || "Failed to load order history.",
          );
        } else {
          setError("Failed to load order history.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated, highlightId]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await axiosInstance.post(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, status: "cancelled", isCancellable: false }
            : o,
        ),
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "cancelled", isCancellable: false } : null,
        );
      }
    } catch (err: unknown) {
      alert("Failed to cancel order. Please contact support.");
    } finally {
      setCancelling(false);
    }
  };

  const getActiveStepIndex = (status: Order["status"]) => {
    if (status === "cancelled") return -1;
    const stepKeys = TIMELINE_STEPS.map((step) => step.key);
    return stepKeys.indexOf(status);
  };

  const renderPaymentBadge = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Paid
          </span>
        );
      case "pending_transfer":
        return (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Transfer Pending
          </span>
        );
      case "pay_on_pickup":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Pay on Pickup
          </span>
        );
      case "failed":
      default:
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            Payment Failed
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-paper/40">
      <Sidebar />

      <main className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm text-mist">My Account</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">My Orders</h1>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-navy-900/10 bg-white">
            <div className="flex items-center gap-2 text-sm text-mist">
              <RefreshCw className="h-5 w-5 animate-spin text-navy-900" />{" "}
              Loading your orders...
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="mt-2 text-sm font-medium text-red-800">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-navy-900/10 bg-white text-center">
            <Package className="h-12 w-12 text-navy-900/20" />
            <h2 className="mt-3 text-lg font-bold text-ink">No orders found</h2>
            <p className="mt-1 text-xs text-mist">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="grid overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-sm lg:grid-cols-[380px_1fr]">
            {/* Left Order History List */}
            <div className="border-b border-navy-900/10 p-5 lg:border-b-0 lg:border-r">
              <h2 className="mb-5 text-xl font-semibold text-ink">
                Orders History
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const orderId = order.id || order._id;
                  const isSelected = selectedOrder?._id === order._id;

                  return (
                    <button
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        isSelected
                          ? "border-gold bg-paper shadow-sm"
                          : "border-navy-900/10 hover:bg-paper/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-ink">
                          #{orderId.slice(-8).toUpperCase()}
                        </h3>
                        {renderPaymentBadge(order.paymentStatus)}
                      </div>
                      <p className="mt-2 text-xs text-mist">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-3 font-semibold text-ink">
                        ₦{order.totalAmount.toLocaleString()}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gold capitalize">
                        {order.fulfilmentMode === "pickup" ? (
                          <Store className="h-3.5 w-3.5" />
                        ) : (
                          <Truck className="h-3.5 w-3.5" />
                        )}
                        <span>{order.status.replace(/_/g, " ")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Details Panel */}
            {selectedOrder && (
              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-mist">
                      Order Details
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                      #
                      {(selectedOrder.id || selectedOrder._id)
                        .slice(-8)
                        .toUpperCase()}
                    </h2>
                    <p className="mt-1 text-xs text-mist">
                      Placed on{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <CreditCard size={16} className="text-gold" />
                        <span className="text-xs font-semibold text-ink capitalize">
                          {selectedOrder.paymentStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-base font-bold text-ink">
                        ₦{selectedOrder.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    {/* 2. Immutable Invoice Download */}
                    {selectedOrder.invoiceToken && (
                      <a
                        href={`/api/invoices/${selectedOrder.invoiceToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4 text-navy-900" /> Receipt
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. Next Actions & Fulfilment Evidence Banner */}
                <div className="mt-6 rounded-2xl border border-navy-900/10 bg-paper/60 p-4 text-xs text-ink space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedOrder.fulfilmentMode === "pickup" ? (
                        <Store className="h-4 w-4 text-gold" />
                      ) : (
                        <Truck className="h-4 w-4 text-gold" />
                      )}
                      <span className="font-semibold capitalize">
                        {selectedOrder.fulfilmentMode === "pickup"
                          ? "Store Pickup"
                          : "Doorstep Delivery"}
                      </span>
                    </div>

                    {selectedOrder.isCancellable && (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder._id)}
                        disabled={cancelling}
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>
                          {cancelling ? "Cancelling..." : "Cancel Order"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Pickup Code or Delivery Tracking */}
                  {selectedOrder.fulfilmentMode === "pickup" &&
                    selectedOrder.pickupCode && (
                      <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-gold/30">
                        <QrCode className="h-5 w-5 text-gold" />
                        <div>
                          <p className="text-[10px] text-mist font-semibold">
                            PICKUP EVIDENCE CODE
                          </p>
                          <p className="text-sm font-mono font-bold text-ink">
                            {selectedOrder.pickupCode}
                          </p>
                        </div>
                      </div>
                    )}

                  {selectedOrder.fulfilmentMode === "delivery" &&
                    selectedOrder.trackingNumber && (
                      <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-navy-900/10">
                        <Truck className="h-5 w-5 text-navy-900" />
                        <div>
                          <p className="text-[10px] text-mist font-semibold">
                            WAYBILL / TRACKING NUMBER
                          </p>
                          <p className="text-xs font-mono font-bold text-ink">
                            {selectedOrder.trackingNumber}
                          </p>
                        </div>
                      </div>
                    )}

                  {selectedOrder.shippingAddress?.street && (
                    <div className="flex items-center gap-1.5 text-mist pt-1 border-t border-navy-900/5">
                      <MapPin className="h-4 w-4 text-mist" />
                      <span>
                        {selectedOrder.shippingAddress.street},{" "}
                        {selectedOrder.shippingAddress.city}
                      </span>
                    </div>
                  )}
                </div>

                {/* Refund & Policy Note */}
                <div className="mt-4 flex items-center gap-2 text-xs text-mist bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    Orders can be cancelled before preparation begins. Refund
                    requests for returned items follow standard policies.
                  </span>
                </div>

                {/* Items Breakdown */}
                <section className="mt-8">
                  <h3 className="mb-4 text-base font-semibold text-ink">
                    Items Ordered
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={`${item.variantSku}-${idx}`}
                        className="flex items-center justify-between rounded-2xl border border-navy-900/10 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper">
                            <Package className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-ink">
                              {item.name}
                            </h4>
                            <p className="text-xs text-mist">
                              SKU: {item.variantSku} | Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-ink">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Customer-Facing Timeline */}
                <section className="mt-10">
                  <h3 className="mb-5 text-base font-semibold text-ink">
                    Fulfillment Progress
                  </h3>

                  {selectedOrder.status === "cancelled" ? (
                    <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                      <XCircle className="h-5 w-5" />
                      <span>This order has been cancelled.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {TIMELINE_STEPS.map((step, index) => {
                        const activeIndex = getActiveStepIndex(
                          selectedOrder.status,
                        );
                        const isCompleted =
                          index <= activeIndex && activeIndex !== -1;

                        return (
                          <div
                            key={step.key}
                            className="flex items-center gap-3"
                          >
                            {isCompleted ? (
                              <CheckCircle2
                                size={20}
                                className="text-gold shrink-0"
                              />
                            ) : (
                              <Circle
                                size={20}
                                className="text-mist shrink-0"
                              />
                            )}
                            <span
                              className={`text-sm ${
                                isCompleted
                                  ? "font-semibold text-ink"
                                  : "text-mist"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
