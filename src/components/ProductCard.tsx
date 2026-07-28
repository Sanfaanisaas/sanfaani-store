import { MockGadget } from "@/lib/mockData/gadgets";
import { Package } from "lucide-react";

const conditionStyles: Record<MockGadget["condition"], string> = {
  New: "bg-blue/10 text-blue",
  "Refurbished — Grade A": "bg-gold/15 text-gold",
  "Used — Grade B": "bg-navy-900/10 text-navy-900",
};

const statusStyles: Record<MockGadget["status"], string> = {
  "In stock": "bg-emerald-500",
  Limited: "bg-gold",
  Sourcing: "bg-mist",
};

export default function ProductCard({ gadget }: { gadget: MockGadget }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-navy-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-36 items-center justify-center bg-navy-900/[0.03] text-4xl">
        <Package className="h-12 w-12 text-navy-900" aria-hidden="true" />
      </div>
      <div className="relative border-t border-dashed border-navy-900/15 px-5 pt-4 pb-5">
        <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-paper" />
        <div className="mb-2 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${conditionStyles[gadget.condition]}`}>
            {gadget.condition}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-mist">
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[gadget.status]}`} />
            {gadget.status}
          </span>
        </div>
        <h3 className="font-display text-base font-semibold text-ink">{gadget.name}</h3>
        <p className="mt-0.5 text-sm text-mist">{gadget.spec}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-ink">
            ₦{gadget.price.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-blue opacity-0 transition group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </div>
  );
}