"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ShieldCheck, Wrench, Layers } from "lucide-react";
import type { PublicProduct, ProductCondition } from "@/lib/api/contracts";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";

function formatCondition(condition?: ProductCondition): string {
  if (!condition) return "Standard";
  switch (condition) {
    case "new":
      return "Brand New";
    case "refurbished_grade_a":
      return "Refurbished — Grade A";
    case "refurbished_grade_b":
      return "Refurbished — Grade B";
    case "used_grade_a":
      return "Used — Grade A";
    case "used_grade_b":
      return "Used — Grade B";
    default:
      return condition;
  }
}

export default function ProductCard({ gadget }: { gadget: PublicProduct }) {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [imageError, setImageError] = useState(false);

  const primary = gadget.variants[0];
  const isAvailable =
    primary?.availability === "in_stock" ||
    primary?.availability === "low_stock";
  const isSourcing = primary?.availability === "sourcing";

  const thumbnail = gadget.images?.[0];
  const isService =
    gadget.category.toLowerCase().includes("service") ||
    gadget.tags?.includes("service");
  const isBundle =
    gadget.category.toLowerCase().includes("bundle") ||
    gadget.tags?.includes("bundle");

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        {/* Media Container with Honest Image & Fallback */}
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-paper">
          {thumbnail && !imageError ? (
            <Image
              src={thumbnail}
              alt={gadget.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-3 transition-transform duration-300 hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-navy-900/40">
              {isService ? (
                <Wrench aria-hidden="true" size={44} />
              ) : isBundle ? (
                <Layers aria-hidden="true" size={44} />
              ) : (
                <Package aria-hidden="true" size={44} />
              )}
            </div>
          )}

          {/* Type Badge */}
          {(isService || isBundle) && (
            <span className="absolute left-3 top-3 rounded-md bg-navy-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {isService ? "Repair Service" : "Bundle"}
            </span>
          )}

          {/* Stock / Sourcing Pill */}
          {isSourcing && (
            <span className="absolute right-3 top-3 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
              Sourcing
            </span>
          )}
        </div>

        {/* Category & Brand */}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-mist">
          <span className="uppercase tracking-[0.14em]">{gadget.category}</span>
          <span>{gadget.brand}</span>
        </div>

        {/* Title */}
        <h2 className="mt-1 text-lg font-bold text-ink">
          <Link
            href={`/shop/${gadget.slug}`}
            className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {gadget.name}
          </Link>
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm text-mist">
          {gadget.description}
        </p>

        {/* Inspection & Warranty Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {primary && (
            <span className="inline-flex items-center rounded-md bg-navy-900/5 px-2 py-0.5 text-xs font-medium text-navy-900">
              {formatCondition(primary.condition)}
            </span>
          )}
          {primary?.warranty && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <ShieldCheck size={12} aria-hidden="true" />
              {primary.warranty.version}
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-6 pt-4 border-t border-navy-900/5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <span className="text-xs text-mist">Starting from</span>
            <p className="font-display text-xl font-semibold text-ink">
              {primary
                ? `₦${primary.price.toLocaleString("en-NG")}`
                : "Unavailable"}
            </p>
          </div>
          {primary?.limitations && (
            <span className="text-xs text-amber-700 underline underline-offset-2">
              Known notes
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            className="flex-1 text-center rounded-full border border-navy-900/20 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-navy-900/5"
            href={`/shop/${gadget.slug}`}
          >
            Details
          </Link>
          <button
            type="button"
            disabled={!primary || (!isAvailable && !isSourcing)}
            onClick={() =>
              primary &&
              addGadgetToCart({
                product: gadget,
                variant: primary,
                isAuthenticated,
                dispatch,
              })
            }
            className="flex-1 rounded-full bg-gold px-3 py-2 text-sm font-semibold text-navy-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSourcing ? "Order In" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
