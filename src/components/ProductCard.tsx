"use client";

import Link from "next/link";
import { Package, ShieldCheck, Wrench } from "lucide-react";

interface ProductCardProps {
  gadget: {
    id?: string;
    _id?: string;
    slug?: string;
    name: string;
    description?: string;
    images?: string[];
    category?: string;
    brand?: string;
    type?: "product" | "bundle" | "repair_service";
    variants?: Array<{
      id: string;
      sku: string;
      price: number;
      condition: string;
      availability: "in_stock" | "low_stock" | "out_of_stock" | "sourcing";
      warranty?: {
        version: string;
        terms: string;
      };
    }>;
  };
}

export default function ProductCard({ gadget }: ProductCardProps) {
  // 1. Resolve active variant or fall back to primary variant projection
  const primaryVariant = gadget.variants?.[0];
  const price = primaryVariant?.price ?? 0;
  const condition = primaryVariant?.condition ?? "Standard Grade";
  const availability = primaryVariant?.availability ?? "out_of_stock";
  const warranty = primaryVariant?.warranty?.terms;

  // 2. Render honest availability badges based on backend specification
  const renderAvailabilityBadge = () => {
    switch (availability) {
      case "in_stock":
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Limited Stock
          </span>
        );
      case "sourcing":
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            On Order / Sourcing
          </span>
        );
      case "out_of_stock":
      default:
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Unavailable
          </span>
        );
    }
  };

  const targetSlug = gadget.slug ?? gadget._id ?? gadget.id;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Honest Media Container */}
      <div className="relative flex h-44 items-center justify-center bg-navy-900/[0.03] p-4">
        {gadget.images && gadget.images[0] ? (
          <img
            src={gadget.images[0]}
            alt={gadget.name}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
        ) : (
          <Package className="h-12 w-12 text-navy-900/30" aria-hidden="true" />
        )}

        {/* Information Architecture Tag */}
        {gadget.type === "repair_service" && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-navy-900 px-2 py-1 text-[10px] font-semibold text-white">
            <Wrench className="w-3 h-3" /> Repair Service
          </span>
        )}
      </div>

      {/* Card Content & Pre-Purchase Disclosures */}
      <div className="flex flex-1 flex-col justify-between border-t border-dashed border-navy-900/15 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            {/* Condition Grade */}
            <span className="rounded-full bg-navy-900/5 px-2.5 py-0.5 text-[11px] font-semibold text-navy-900 capitalize">
              {condition.replace(/_/g, " ")}
            </span>
            {renderAvailabilityBadge()}
          </div>

          <h3 className="font-display text-base font-semibold text-ink line-clamp-1">
            {gadget.name}
          </h3>

          <p className="mt-1 text-xs text-mist line-clamp-2">
            {gadget.description || "No description provided."}
          </p>

          {/* Warranty Disclosure */}
          {warranty && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{warranty}</span>
            </div>
          )}
        </div>

        {/* Footer / Price & Details CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-navy-900/5 pt-3">
          <span className="font-display text-lg font-bold text-ink">
            ₦{price.toLocaleString()}
          </span>
          <Link
            href={`/products/${targetSlug}`}
            className="text-xs font-semibold text-navy-900 transition hover:text-gold"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
