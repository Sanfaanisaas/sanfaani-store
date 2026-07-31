"use client";

import { useState } from "react";

const categories = [
  { key: "All", label: "All" },
  { key: "Laptops", label: "Laptops" },
  { key: "Phones & Tablets", label: "Phones & Tablets" },
  { key: "Accessories", label: "Accessories" },
  { key: "Repair Services", label: "Repair Services" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

interface VerticalTabsProps {
  activeCategory: CategoryKey;
  onChange: (category: CategoryKey) => void;
}

export default function VerticalTabs({ activeCategory, onChange }: VerticalTabsProps) {
  return (
    <nav className="flex flex-col gap-1" role="tablist" aria-label="Product categories">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.key)}
            className={`
              relative flex items-center gap-3 px-5 py-3 text-left text-sm font-medium transition-colors
              ${isActive ? "text-gold" : "text-mist hover:text-ink"}
            `}
          >
            {isActive && (
              <span className="absolute left-0 top-0 h-full w-0.5 bg-gold" aria-hidden="true" />
            )}
            {cat.label}
          </button>
        );
      })}
    </nav>
  );
}
