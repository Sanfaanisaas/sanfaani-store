"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingState } from "@/components/ApiState";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchOrderById } from "@/lib/api/ordersApi";
import { fetchPaymentStatus } from "@/lib/api/paymentsApi";
import type { NormalizedOrder } from "@/lib/api/normalizers/orderNormalizer";

function ReturnContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<NormalizedOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [state, setState] = useState<"verifying" | "confirmed" | "pending" | "failed">("verifying");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const timer = window.setTimeout(() => {
      const orderId = searchParams.get("orderId") ?? sessionStorage.getItem("pendingCheckoutOrderId");
      const paymentId = searchParams.get("paymentId") ?? sessionStorage.getItem("pendingCheckoutPaymentId");
      if (!orderId) {
        setState("failed");
        return;
      }

      const verify = async () => {
        attempts += 1;
        const result = await fetchOrderById(orderId);
        if (cancelled) return;
        if (!result) {
          if (attempts < 5) window.setTimeout(verify, 1500);
          else setState("failed");
          return;
        }
        setOrder(result);
        let resolvedPaymentStatus = result.paymentStatus;
        if (paymentId) {
          try {
            const payment = await fetchPaymentStatus(paymentId);
            resolvedPaymentStatus = payment.status;
          } catch {
            resolvedPaymentStatus = result.paymentStatus;
          }
        }
        setPaymentStatus(resolvedPaymentStatus);
        if (result.paymentStatus === "paid" || resolvedPaymentStatus === "confirmed" || resolvedPaymentStatus === "paid") {
          setState("confirmed");
          sessionStorage.removeItem("pendingCheckoutOrderId");
          sessionStorage.removeItem("pendingCheckoutPaymentId");
        } else if (attempts < 8) {
          setState("pending");
          window.setTimeout(verify, 2000);
        } else {
          setState("pending");
        }
      };

      void verify();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchParams]);

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border bg-white p-8">
      <h1 className="font-display text-3xl font-semibold">Verifying payment</h1>
      <p className="mt-3 text-sm text-mist">We never mark payment successful from the browser callback alone. This page checks the authoritative order and payment records.</p>
      {state === "verifying" || state === "pending" ? <LoadingState>Waiting for server confirmation…</LoadingState> : null}
      {order && (
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Order reference</dt><dd>{order.id}</dd></div>
          <div className="flex justify-between"><dt>Payment status</dt><dd>{paymentStatus || order.paymentStatus}</dd></div>
          <div className="flex justify-between"><dt>Order status</dt><dd>{order.status}</dd></div>
        </dl>
      )}
      {state === "confirmed" && order ? (
        <Link href={"/checkout/confirmation?orderId=" + encodeURIComponent(order.id)} className="mt-6 inline-block font-semibold text-blue underline">Continue to confirmation</Link>
      ) : null}
      {state === "failed" ? <p className="mt-6 text-sm text-mist">We could not verify this return yet. Check your orders or contact support.</p> : null}
    </section>
  );
}

export default function CheckoutReturnPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Suspense fallback={<LoadingState>Loading payment return…</LoadingState>}>
          <ReturnContent />
        </Suspense>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
