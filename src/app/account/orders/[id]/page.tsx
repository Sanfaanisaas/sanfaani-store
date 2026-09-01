"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cancelOrder, downloadOrderReceipt, fetchOrderById } from "@/lib/api/ordersApi";
import { buildOrderTimeline, canCancelOrder, canRequestRefund, type NormalizedOrder } from "@/lib/api/normalizers/orderNormalizer";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { ApiError, errorMessage } from "@/lib/api/client";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const [order, setOrder] = useState<NormalizedOrder | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetchOrderById(orderId);
      if (!result) {
        setState("forbidden");
        return;
      }
      setOrder(result);
      setState("ready");
    } catch (error) {
      if (error instanceof ApiError && (error.kind === "forbidden" || error.kind === "not_found")) {
        setState("forbidden");
        return;
      }
      setState("error");
    }
  }, [orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    setMessage(null);
    try {
      const updated = await cancelOrder(order.id, crypto.randomUUID());
      setOrder(updated);
      setMessage("Your cancellation request was confirmed by the server.");
    } catch (error) {
      setMessage(errorMessage(error, "This order cannot be cancelled right now."));
    } finally {
      setCancelling(false);
    }
  }

  async function handleReceipt() {
    if (!order) return;
    try {
      const blob = await downloadOrderReceipt(order.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "receipt-" + order.id + ".pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Receipt download is unavailable.");
    }
  }

  if (state === "loading") return <LoadingState>Loading order details…</LoadingState>;
  if (state === "forbidden") return <EmptyState title="Order unavailable">This order does not exist or does not belong to your account.</EmptyState>;
  if (state === "error") return <ErrorState message="We could not load this order." onRetry={() => void load()} />;
  if (!order) return null;

  const timeline = buildOrderTimeline(order);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/account/orders" className="text-sm font-semibold text-blue underline">← Back to orders</Link>
      <header className="mt-4">
        <h1 className="font-display text-3xl font-semibold">Order {order.id}</h1>
        <p className="mt-2 text-sm text-mist">Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : "date unavailable"}</p>
      </header>
      {message && <p role="status" className="mt-4 rounded-xl bg-paper p-4 text-sm">{message}</p>}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={item.variantSku} className="flex justify-between gap-3">
                <span>{item.name} × {item.quantity}</span>
                <span>₦{(item.price * item.quantity).toLocaleString("en-NG")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t pt-4 font-semibold">Total: ₦{order.total.toLocaleString("en-NG")}</p>
        </article>
        <article className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold">Status</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Order</dt><dd>{order.status}</dd></div>
            <div className="flex justify-between"><dt>Payment</dt><dd>{order.paymentStatus}</dd></div>
            <div className="flex justify-between"><dt>Fulfilment</dt><dd>{order.paymentMethod === "pay_on_pickup" ? "Pickup" : "Delivery"}</dd></div>
          </dl>
          <h3 className="mt-6 font-semibold">Timeline</h3>
          <ol className="mt-3 space-y-2 text-sm">
            {timeline.map((event) => (
              <li key={event.label}>
                <strong>{event.label}</strong>
                {event.at ? <span className="text-mist"> · {new Date(event.at).toLocaleString()}</span> : null}
                {event.detail ? <p className="text-mist">{event.detail}</p> : null}
              </li>
            ))}
          </ol>
        </article>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => void handleReceipt()} className="rounded-full border px-5 py-2 text-sm font-semibold">Download receipt</button>
        {canCancelOrder(order) ? (
          <button type="button" disabled={cancelling} onClick={() => void handleCancel()} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy-900 disabled:opacity-50">Cancel order</button>
        ) : null}
        {canRequestRefund(order) ? <p className="text-sm text-mist">Refund eligibility is reviewed by support after cancellation or return.</p> : null}
      </div>
    </main>
  );
}
