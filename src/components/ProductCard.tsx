import { Package } from "lucide-react";
import Link from "next/link";

export default function ProductCard({ gadget }: { gadget: any }) {
  const price = gadget.variants?.[0]?.price || gadget.price || 0;
  const condition = gadget.condition || "New";
  const inStock = gadget.in_stock !== undefined ? gadget.in_stock : gadget.status === "In stock";
  
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-navy-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-36 items-center justify-center bg-navy-900/[0.03] text-4xl">
        {gadget.images?.[0] ? (
          <img src={gadget.images[0]} alt={gadget.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="h-12 w-12 text-navy-900" aria-hidden="true" />
        )}
      </div>
      <div className="relative border-t border-dashed border-navy-900/15 px-5 pt-4 pb-5">
        <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-paper" />
        <div className="mb-2 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue/10 text-blue`}>
            {condition}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-mist">
            <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-mist"}`} />
            {inStock ? "In Stock" : "Unavailable"}
          </span>
        </div>
        <h3 className="font-display text-base font-semibold text-ink">{gadget.name}</h3>
        <p className="mt-0.5 text-sm text-mist line-clamp-1">{gadget.description || gadget.spec}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-ink">
            ₦{price.toLocaleString()}
          </span>
          <Link href={`/shop/${gadget.id || gadget._id}`} className="text-xs cursor-pointer font-medium text-blue transition hover:text-gold">
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}