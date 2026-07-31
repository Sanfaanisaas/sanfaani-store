"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function RepairTrackLanding() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!trackingId.trim()) {
      setError("Please enter a valid Tracking ID or Order Reference.");
      return;
    }

    setIsSubmitting(true);
    // Submit to /repair/track/[id]
    router.push(`/repair/track/${encodeURIComponent(trackingId.trim())}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white border border-navy-900/10 shadow-sm rounded-xl p-6 sm:p-8 space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-paper mb-4">
              <Search className="w-6 h-6 text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Track Your Repair</h2>
            <p className="text-mist text-sm mt-2">
              Enter your tracking ID or order reference to see the current status of your device.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="trackingId" className="block text-sm font-medium text-ink">
              Tracking ID / Order Reference
            </label>
            <input
              type="text"
              id="trackingId"
              placeholder="e.g. REP-123456"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full bg-paper text-ink border border-navy-900/10 rounded-md p-2.5 outline-none focus:border-gold transition-colors text-sm"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold hover:bg-gold/90 text-navy-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <span>Track Repair</span>
            )}
          </button>
        </form>
      </main>
    </>
  );
}
