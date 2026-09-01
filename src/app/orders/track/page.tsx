"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function OrderTrackingEntry() {
  const router = useRouter();
  const [orderReference, setOrderReference] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = orderReference.trim();
    if (!id) return;
    router.push("/account/orders/" + encodeURIComponent(id));
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-lg px-6 py-16 sm:py-24">
        <section className="rounded-xl border border-navy-900/10 bg-white p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Search className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">Track your order</h1>
            <p className="mt-2 text-sm text-mist">Enter your order reference after signing in. A reference alone does not grant access to another customer&apos;s order.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label htmlFor="orderReference" className="block text-sm font-medium text-ink">
              Order reference
              <input
                id="orderReference"
                required
                value={orderReference}
                onChange={(event) => setOrderReference(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-navy-900/10 bg-paper p-2.5 text-sm text-ink outline-none transition-colors focus:border-gold"
              />
            </label>
            <p className="text-xs text-mist">You will be asked to sign in if needed. Tracking credentials are never placed in the URL.</p>
            <button type="submit" disabled={!orderReference.trim()} className="flex w-full items-center justify-center rounded-lg bg-gold py-3 text-sm font-bold text-navy-900 disabled:opacity-50">
              Continue securely
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
