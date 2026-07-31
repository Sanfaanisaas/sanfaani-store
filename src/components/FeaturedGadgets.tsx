"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import VerticalTabs from "./VerticalTabs";
import { mockGadgets } from "@/lib/mockData/gadgets";

export default function FeaturedGadgets() {
  const [activeCategory, setActiveCategory] = useState<"All" | "Laptops" | "Phones & Tablets" | "Accessories" | "Repair Services">("All");

  const filtered = activeCategory === "All"
    ? mockGadgets
    : mockGadgets.filter((g) => g.category === activeCategory);

  return (
    <section id="shop" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Featured devices</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Every device, condition-checked</h2>
        </div>
        <p className="max-w-xs text-sm text-mist">
          Preview catalogue — full shop, filters and checkout are launching soon.
        </p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <VerticalTabs activeCategory={activeCategory} onChange={setActiveCategory} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <ProductCard key={g.id} gadget={g} />
          ))}
        </div>
      </div>
    </section>
  );
}