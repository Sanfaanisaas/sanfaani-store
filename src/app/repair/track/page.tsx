"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Wrench, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { rememberTrackingToken } from "@/lib/api/repairsApi";

type TrackMode = "repair" | "order";

export default function TrackingEntryPage() {
  const router = useRouter();
  const [trackMode, setTrackMode] = useState<TrackMode>("repair");

  // Repair tracking state
  const [repairId, setRepairId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  // Order tracking state
  const [orderId, setOrderId] = useState("");

  function handleRepairSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = repairId.trim();
    if (!id) return;
    if (trackingToken.trim()) rememberTrackingToken(id, trackingToken.trim());
    router.push(`/repair/track/${encodeURIComponent(id)}`);
  }

  function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    router.push(`/account/orders/${encodeURIComponent(id)}`);
  }

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="mx-auto max-w-lg px-6 py-14 sm:py-20 min-h-screen"
      >
        <section className="rounded-3xl border border-navy-900/10 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-navy-900">
              <Search className="h-6 w-6 text-navy-900" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Track Status
            </h1>
            <p className="mt-1 text-xs text-mist">
              Check live status and updates for your device repairs or store
              orders.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1.5"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={trackMode === "repair"}
              onClick={() => setTrackMode("repair")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                trackMode === "repair"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-mist hover:text-ink"
              }`}
            >
              <Wrench size={14} /> Track Repair
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={trackMode === "order"}
              onClick={() => setTrackMode("order")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                trackMode === "order"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-mist hover:text-ink"
              }`}
            >
              <Package size={14} /> Track Order
            </button>
          </div>

          {/* Repair Tracking Form */}
          {trackMode === "repair" ? (
            <form onSubmit={handleRepairSubmit} className="space-y-4">
              <label
                htmlFor="repairId"
                className="block text-xs font-semibold text-ink"
              >
                Repair Reference *
                <input
                  id="repairId"
                  required
                  placeholder="e.g. REP-83921 or 64f..."
                  value={repairId}
                  onChange={(e) => setRepairId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy-900/15 bg-paper p-3 text-xs text-ink outline-none transition focus:border-navy-900"
                />
              </label>

              <label
                htmlFor="trackingToken"
                className="block text-xs font-semibold text-ink"
              >
                Tracking Credential{" "}
                <span className="font-normal text-mist">
                  (required when signed out)
                </span>
                <input
                  id="trackingToken"
                  type="password"
                  autoComplete="off"
                  placeholder="One-time secret token"
                  value={trackingToken}
                  onChange={(e) => setTrackingToken(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy-900/15 bg-paper p-3 text-xs text-ink outline-none transition focus:border-navy-900"
                />
                <span className="mt-1 block text-[11px] font-normal text-mist">
                  Kept in memory for this session to preserve privacy.
                </span>
              </label>

              <button
                type="submit"
                disabled={!repairId.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gold py-3 text-xs font-bold text-navy-900 transition hover:brightness-95 disabled:opacity-50"
              >
                Track Repair Progress <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            /* Order Tracking Form */
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <label
                htmlFor="orderId"
                className="block text-xs font-semibold text-ink"
              >
                Order Number or Reference *
                <input
                  id="orderId"
                  required
                  placeholder="e.g. SF-ORD-2026-01 or 64f..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy-900/15 bg-paper p-3 text-xs text-ink outline-none transition focus:border-navy-900"
                />
              </label>

              <button
                type="submit"
                disabled={!orderId.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-navy-900 py-3 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-50"
              >
                View Order & Fulfilment Status <ArrowRight size={14} />
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
