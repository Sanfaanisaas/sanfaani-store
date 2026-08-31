"use client";
import Link from "next/link";
import { useState } from "react";
type Consent = {
  version: "2026-08-28";
  essential: true;
  analytics: boolean;
  updatedAt: string;
};
const KEY = "sanfaani.consent.v1";
function savedConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(KEY) ?? "null",
    );
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
  const [consent, setConsent] = useState<Consent | null>(savedConsent);
  const [editing, setEditing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  function save(next: boolean) {
    const record: Consent = {
      version: "2026-08-28",
      essential: true,
      analytics: next,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(record));
    setAnalytics(next);
    setConsent(record);
    setEditing(false);
  }
  if (consent && !editing)
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="fixed bottom-3 left-3 z-50 rounded-full border border-navy-900/20 bg-white px-3 py-2 text-xs font-semibold text-ink shadow"
      >
        Cookie settings
      </button>
    );
  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label="Cookie settings"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-navy-900/15 bg-white p-5 shadow-xl"
    >
      <h2 className="font-semibold text-ink">Your privacy choices</h2>
      <p className="mt-2 text-sm text-mist">
        Essential storage supports security and the shopping experience.
        Analytics is optional and is disabled unless you choose it. No analytics
        scripts are initialized by this app.
      </p>
      <label className="mt-4 flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={analytics}
          onChange={(event) => setAnalytics(event.target.checked)}
        />
        Allow optional analytics
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          className="rounded-full border border-navy-900/20 px-4 py-2 text-sm font-semibold"
        >
          Use essential only
        </button>
        <button
          type="button"
          onClick={() => save(analytics)}
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy-900"
        >
          Save choice
        </button>
      </div>
      <p className="mt-3 text-xs text-mist">
        <Link href="/policies/cookies" className="underline">
          Cookie policy
        </Link>{" "}
        · You can update this choice at any time.
      </p>
    </section>
  );
}
