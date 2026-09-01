"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingState } from "@/components/ApiState";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchOrderById } from "@/lib/api/ordersApi";
import type { NormalizedOrder } from "@/lib/api/normalizers/orderNormalizer";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [order, setOrder] = useState<NormalizedOrder | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!orderId) {
        setState("missing");
        return;
      }
      void fetchOrderById(orderId)
        .then((result) => {
          if (!result) setState("missing");
          else {
            setOrder(result);
            setState("ready");
          }
        })
        .catch(() => setState("missing"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [orderId]);

  if (state === "loading") return <LoadingState>Confirming your order…</LoadingState>;

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border bg-white p-8">
      {state === "missing" || !order ? (
        <>
          <h1 className="font-display text-3xl font-semibold">Order confirmation pending</h1>
          <p className="mt-3 text-sm text-mist">We could not verify this order yet. Check your account orders or try again shortly.</p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-semibold">Order confirmed</h1>
          <p className="mt-3 text-sm text-mist">Reference: {order.id}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Payment status</dt><dd>{order.paymentStatus}</dd></div>
            <div className="flex justify-between"><dt>Order status</dt><dd>{order.status}</dd></div>
            <div className="flex justify-between"><dt>Total</dt><dd>₦{order.total.toLocaleString("en-NG")}</dd></div>
            <div className="flex justify-between"><dt>Fulfilment</dt><dd>{order.paymentMethod === "pay_on_pickup" ? "Pickup" : "Delivery"}</dd></div>
          </dl>
          <Link href={"/account/orders/" + encodeURIComponent(order.id)} className="mt-6 inline-block font-semibold text-blue underline">View order details</Link>
        </>
      )}
    </section>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Suspense fallback={<LoadingState>Loading confirmation…</LoadingState>}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
