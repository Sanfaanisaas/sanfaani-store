"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type Consent = {
  version: "2026-08-28";
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

const KEY = "sanfaani.consent.v1";

function readStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return value &&
      typeof value === "object" &&
      (value as { version?: unknown }).version === "2026-08-28"
      ? (value as Consent)
      : null;
  } catch {
    return null;
  }
}

export default function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [editing, setEditing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  // Sync with localStorage on client mount
  useEffect(() => {
    const saved = readStoredConsent();
    if (saved) {
      setConsent(saved);
      setAnalytics(saved.analytics);
    }
    setMounted(true);
  }, []);

  function save(nextAnalyticsChoice: boolean) {
    const record: Consent = {
      version: "2026-08-28",
      essential: true,
      analytics: nextAnalyticsChoice,
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(KEY, JSON.stringify(record));
    } catch {
      // Storage unavailable / private mode
    }

    setAnalytics(nextAnalyticsChoice);
    setConsent(record);
    setEditing(false);
  }

  // Prevent SSR flash / hydration mismatch before mount
  if (!mounted) {
    return null;
  }

  // Compact trigger button when consent has already been given
  if (consent && !editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setAnalytics(consent.analytics);
          setEditing(true);
        }}
        className="fixed bottom-3 left-3 z-50 rounded-full border border-navy-900/20 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-md transition hover:bg-navy-900/5 focus:outline-none focus:ring-2 focus:ring-navy-900"
      >
        Cookie settings
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label="Cookie settings"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-navy-900/15 bg-white p-5 shadow-xl transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-ink">Your privacy choices</h2>
          <p className="mt-2 text-sm text-mist">
            Essential storage supports security and the shopping experience.
            Analytics is optional and is disabled unless you choose it. No
            analytics scripts are initialized by this app.
          </p>
        </div>

        {/* Close/Cancel button if user is just reviewing settings */}
        {consent && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs font-semibold text-mist hover:text-ink"
            aria-label="Close settings"
          >
            Cancel
          </button>
        )}
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm cursor-pointer select-none text-ink">
        <input
          type="checkbox"
          checked={analytics}
          onChange={(event) => setAnalytics(event.target.checked)}
          className="rounded border-navy-900/20 text-navy-900 focus:ring-navy-900"
        />
        Allow optional analytics
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          className="rounded-full border border-navy-900/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-900/5"
        >
          Use essential only
        </button>
        <button
          type="button"
          onClick={() => save(analytics)}
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:brightness-95"
        >
          Save choice
        </button>
      </div>

      <p className="mt-3 text-xs text-mist">
        <Link href="/policies/cookies" className="underline hover:text-ink">
          Cookie policy
        </Link>{" "}
        · You can update this choice at any time.
      </p>
    </section>
  );
}
