"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Truck,
  Store,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient, errorMessage } from "@/lib/api/client";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { formatPrice } from "@/lib/formatPrice";

interface OrderLineItem {
  sku?: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  fulfilmentMode?: "delivery" | "pickup";
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  pickupLocation?: string;
  items: OrderLineItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  createdAt?: string;
}

function normalizeOrder(value: unknown): Order {
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
    status: typeof item.status === "string" ? item.status : "pending",
    paymentStatus:
      typeof item.paymentStatus === "string"
        ? item.paymentStatus
        : typeof item.isPaid === "boolean"
          ? item.isPaid
            ? "paid"
            : "pending"
          : "pending",
    paymentMethod:
      typeof item.paymentMethod === "string" ? item.paymentMethod : undefined,
    fulfilmentMode: item.fulfilmentMode === "pickup" ? "pickup" : "delivery",
    shippingAddress:
      item.shippingAddress && typeof item.shippingAddress === "object"
        ? (item.shippingAddress as Order["shippingAddress"])
        : undefined,
    pickupLocation:
      typeof item.pickupLocation === "string" ? item.pickupLocation : undefined,
    items: normalizedItems,
    subtotal: typeof item.subtotal === "number" ? item.subtotal : undefined,
    deliveryFee: typeof item.deliveryFee === "number" ? item.deliveryFee : 0,
    totalAmount: total,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Order history is unavailable.");

  const load = useCallback(async () => {
    try {
      const data = await apiClient.get<unknown[]>("/orders/mine");
      setOrders(
        Array.isArray(data)
          ? data.map(normalizeOrder).filter((order) => order.id)
          : [],
      );
      setState("ready");
    } catch (error) {
      setMessage(errorMessage(error, "Order history is unavailable."));
      setState("error");
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!ignore) {
        await load();
      }
    };
    void run();
    return () => {
      ignore = true;
    };
  }, [load]);

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="mx-auto max-w-5xl px-6 py-10 min-h-screen"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              My orders
            </h1>
            <p className="mt-1 text-sm text-mist">
              Review and print immutable receipts and delivery updates.
            </p>
          </div>
          <Link
            href="/shop"
            className="rounded-full border border-navy-900/20 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-navy-900/5"
          >
            Shop More
          </Link>
        </div>

        <section className="mt-8">
          {state === "loading" ? (
            <LoadingState>Loading your orders…</LoadingState>
          ) : state === "error" ? (
            <ErrorState message={message} onRetry={() => void load()} />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders found">
              Your completed checkout orders and receipts will appear here.
              <div className="mt-4">
                <Link
                  href="/shop"
                  className="font-semibold text-blue underline"
                >
                  Browse catalogue
                </Link>
              </div>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const isPaid =
                  order.paymentStatus === "paid" ||
                  order.paymentStatus === "completed";

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-ink">
                            Order #{order.orderNumber || order.id}
                          </h2>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {order.paymentStatus?.toUpperCase() || "PENDING"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-mist">
                          Placed on:{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-NG",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "Recent"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-display font-semibold text-ink">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <span className="text-xs text-mist capitalize">
                            {order.status.replaceAll("_", " ")}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderId(isExpanded ? null : order.id)
                          }
                          className="rounded-full border border-navy-900/10 p-2 text-ink transition hover:bg-navy-900/5"
                          aria-label={
                            isExpanded ? "Hide details" : "View receipt"
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Immutable Invoice / Receipt */}
                    {isExpanded && (
                      <div className="border-t border-navy-900/10 bg-paper p-6 text-sm">
                        <div className="flex justify-between items-center pb-4 border-b border-navy-900/10">
                          <span className="font-semibold text-navy-900 flex items-center gap-2">
                            <FileText size={16} /> Order Receipt & Breakdown
                          </span>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/20 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-900/5"
                          >
                            <Printer size={13} /> Print Invoice
                          </button>
                        </div>

                        {/* Items list */}
                        <div className="mt-4 divide-y divide-navy-900/5">
                          {order.items.map((item, idx) => (
                            <div
                              key={
                                item.sku
                                  ? `${item.sku}-${idx}`
                                  : `${item.name}-${idx}`
                              }
                              className="py-2.5 flex justify-between gap-3 text-xs"
                            >
                              <div>
                                <strong className="text-ink">
                                  {item.name}
                                </strong>
                                {item.sku && (
                                  <span className="text-mist block">
                                    SKU: {item.sku}
                                  </span>
                                )}
                              </div>
                              <span className="text-mist">
                                {item.quantity} × {formatPrice(item.price)} ={" "}
                                <strong className="text-ink">
                                  {formatPrice(item.price * item.quantity)}
                                </strong>
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Summary & Fulfilment Details */}
                        <div className="mt-4 grid gap-4 pt-4 border-t border-navy-900/10 sm:grid-cols-2 text-xs">
                          <div className="rounded-xl bg-white p-3 border border-navy-900/5">
                            <span className="font-semibold text-ink flex items-center gap-1.5">
                              {order.fulfilmentMode === "pickup" ? (
                                <Store size={14} className="text-navy-900" />
                              ) : (
                                <Truck size={14} className="text-navy-900" />
                              )}
                              Fulfilment:{" "}
                              {order.fulfilmentMode === "pickup"
                                ? "Store Pickup"
                                : "Doorstep Delivery"}
                            </span>
                            {order.fulfilmentMode === "pickup" ? (
                              <p className="mt-1 text-mist">
                                {order.pickupLocation ||
                                  "Sanfaani Store — Main Branch"}
                              </p>
                            ) : (
                              <p className="mt-1 text-mist">
                                {order.shippingAddress?.street},{" "}
                                {order.shippingAddress?.city},{" "}
                                {order.shippingAddress?.state}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1 rounded-xl bg-white p-3 border border-navy-900/5 text-right">
                            <div className="flex justify-between text-mist">
                              <span>Delivery Fee:</span>
                              <span>
                                {order.deliveryFee
                                  ? formatPrice(order.deliveryFee)
                                  : "FREE"}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-ink border-t border-navy-900/10 pt-1 text-sm">
                              <span>Grand Total:</span>
                              <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
