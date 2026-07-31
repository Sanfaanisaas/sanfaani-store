"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function RepairTrackingEntry() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsSubmitting(true);
    router.push(`/repair/track/${trackingId.trim()}`);
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-lg px-6 py-16 sm:py-24">
        <div className="rounded-xl border border-navy-900/10 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Search className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">Track Your Repair</h1>
            <p className="mt-2 text-sm text-mist">
              Enter your tracking ID or order reference to see the current status of your device.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="trackingId" className="block text-sm font-medium text-ink mb-1.5">
                Tracking ID / Reference <span className="text-red-500">*</span>
              </label>
              <input
                id="trackingId"
                type="text"
                required
                placeholder="e.g. SNF-123456"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full rounded-md border border-navy-900/10 bg-paper p-2.5 text-sm text-ink outline-none transition-colors focus:border-gold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !trackingId.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-bold text-navy-900 shadow-sm transition-colors hover:bg-gold/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Track Status"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
