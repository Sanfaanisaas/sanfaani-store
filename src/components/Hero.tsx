"use client";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="bg-navy-900 text-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Sanfaani Store & Repair
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Better tech.
            <br />
            Less stress.
          </h1>
          <p className="mt-6 max-w-md text-paper/70">
            Browse condition-checked devices and request repairs with an
            approval-based, trackable workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-900"
            >
              Browse devices
            </Link>
            <Link
              href="/guides"
              className="rounded-full border border-paper/30 px-6 py-3 text-sm font-medium text-paper"
            >
              Buyer guides
            </Link>
          </div>
        </div>
        <div className="hidden rounded-3xl border border-paper/15 bg-paper/5 p-8 lg:block">
          <p className="text-sm text-paper/70">
            Current price, stock, and condition details are loaded from the live
            catalogue when you browse.
          </p>
        </div>
      </div>
    </section>
  );
}
