"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Store,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
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
              Track live fulfilment status, view timelines, and download
              receipts.
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
                const isPaid =
                  order.paymentStatus === "paid" ||
                  order.paymentStatus === "completed";

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
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
                          Placed on{" "}
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
                          {" · "}
                          <span className="inline-flex items-center gap-1">
                            {order.fulfilmentMode === "pickup" ? (
                              <Store size={12} />
                            ) : (
                              <Truck size={12} />
                            )}
                            {order.fulfilmentMode === "pickup"
                              ? "Store Pickup"
                              : "Doorstep Delivery"}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-display font-semibold text-ink">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <span className="text-xs font-medium capitalize text-navy-900/70">
                            {order.status.replaceAll("_", " ")}
                          </span>
                        </div>

                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-navy-800"
                        >
                          View Details & Tracking
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-navy-900/5 pt-3">
                      <p className="text-xs text-mist flex items-center gap-1.5">
                        <Package size={13} />
                        {order.items.length} item
                        {order.items.length === 1 ? "" : "s"}:{" "}
                        <span className="text-ink font-medium">
                          {order.items
                            .map((i) => `${i.name} (x${i.quantity})`)
                            .join(", ")}
                        </span>
                      </p>
                    </div>
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
