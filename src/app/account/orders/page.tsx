"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchMyOrders } from "@/lib/api/ordersApi";
import type { NormalizedOrder } from "@/lib/api/normalizers/orderNormalizer";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { errorMessage } from "@/lib/api/client";

export default function OrdersPage() {
  const [orders, setOrders] = useState<NormalizedOrder[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Order history is unavailable.");

  const load = useCallback(async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data.orders);
      setState("ready");
    } catch (error) {
      setMessage(errorMessage(error, "Order history is unavailable."));
      setState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold">My orders</h1>
      <section className="mt-6">
        {state === "loading" ? (
          <LoadingState>Loading your orders…</LoadingState>
        ) : state === "error" ? (
          <ErrorState message={message} onRetry={() => void load()} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found">Your completed checkout orders will appear here.</EmptyState>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-navy-900/10 bg-white p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      <Link href={"/account/orders/" + encodeURIComponent(order.id)} className="text-blue underline">
                        Order {order.id}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-mist">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date unavailable"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.status}</p>
                    <p className="text-sm text-mist">Payment: {order.paymentStatus}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">Total: ₦{order.total.toLocaleString("en-NG")}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
