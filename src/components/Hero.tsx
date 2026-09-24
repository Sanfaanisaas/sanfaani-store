"use client";

import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck, Sparkles, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* =========================================================
          BACKGROUND DETAILS
      ========================================================= */}

      {/* Large soft glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-yellow-100/60 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-slate-200/60 blur-3xl" />

      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
          {/* =====================================================
              LEFT CONTENT
          ===================================================== */}

          <div className="relative z-20 max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-white">
                <Sparkles size={14} />
              </span>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="h-px w-8 bg-slate-300" />
                Sanfaani Technology
              </div>
            </div>

            {/* Main heading */}
            <h1 className="max-w-[700px] font-display text-5xl font-black leading-[0.98] tracking-[-0.04em] text-navy-900 sm:text-6xl lg:text-[76px]">
              Technology
              <br />
              <span className="relative inline-block">
                made
                <span className="relative ml-3 inline-block text-gold">
                  simple.
                  <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-gold/30" />
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              Discover carefully selected devices, transparent prices, and
              reliable support — so you can choose your next piece of technology
              with confidence.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="group inline-flex h-14 items-center gap-3 rounded-xl bg-navy-900 px-7 text-sm font-bold text-white shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-1 hover:bg-navy-800"
              >
                Explore devices
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowUpRight size={16} />
                </span>
              </Link>

              <Link
                href="/guides"
                className="group inline-flex h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-7 text-sm font-bold text-navy-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                Find your device
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-slate-200 pt-7">
              <div className="flex items-center gap-2.5">
                <Check size={17} strokeWidth={3} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">
                  Inspected devices
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Check size={17} strokeWidth={3} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">
                  Transparent pricing
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Check size={17} strokeWidth={3} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">
                  Warranty support
                </span>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT VISUAL
          ===================================================== */}

          <div className="relative min-h-[520px] sm:min-h-[620px] lg:min-h-[680px]">
            {/* Large decorative circle */}
            <div className="absolute right-[5%] top-[8%] h-[390px] w-[390px] rounded-full border border-slate-200/80 sm:h-[500px] sm:w-[500px] lg:h-[580px] lg:w-[580px]" />

            {/* Inner circle */}
            <div className="absolute right-[14%] top-[17%] h-[310px] w-[310px] rounded-full bg-white shadow-[0_30px_100px_rgba(15,23,42,0.08)] sm:h-[410px] sm:w-[410px] lg:h-[470px] lg:w-[470px]" />

            {/* Gold accent */}
            <div className="absolute right-[8%] top-[12%] h-5 w-5 rounded-full bg-gold shadow-lg shadow-yellow-400/30" />

            {/* Image */}
            <div className="absolute inset-x-0 top-8 mx-auto h-[500px] w-full max-w-[520px] sm:h-[600px] lg:top-0 lg:h-[650px]">
              <img
                src="/hero.png"
                alt="Sanfaani devices"
                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_35px_35px_rgba(15,23,42,0.22)]"
              />
            </div>

            {/* =================================================
                VERIFIED CARD
            ================================================= */}

            <div className="absolute left-0 top-[20%] z-20 hidden w-[190px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:block lg:left-0">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={21} />
                </div>

                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                  Trusted
                </span>
              </div>

              <p className="mt-4 text-sm font-black text-navy-900">
                Verified device
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Checked for quality before it reaches you.
              </p>
            </div>

            {/* =================================================
                PRICE CARD
            ================================================= */}

            <div className="absolute bottom-[17%] right-0 z-20 w-[210px] rounded-2xl border border-white/80 bg-navy-900 p-5 text-white shadow-2xl shadow-slate-900/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Starting from
              </p>

              <p className="mt-2 font-display text-2xl font-black">
                85,000{" "}
                <span className="text-xs font-bold text-white/50">Naira</span>
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-0.5 text-gold">
                  <Star size={11} fill="currentColor" />
                  <Star size={11} fill="currentColor" />
                  <Star size={11} fill="currentColor" />
                  <Star size={11} fill="currentColor" />
                  <Star size={11} fill="currentColor" />
                </div>

                <span className="text-[10px] text-white/50">
                  Quality checked
                </span>
              </div>
            </div>

            {/* =================================================
                NUMBER / LABEL
            ================================================= */}

            <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-4 text-slate-400 lg:flex">
              <span className="text-[10px] font-black tracking-[0.3em]">
                01
              </span>

              <span className="h-px w-12 bg-slate-300" />

              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                Device discovery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />
    </section>
  );
}
