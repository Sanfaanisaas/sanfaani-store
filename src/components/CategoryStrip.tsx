import { Laptop, Smartphone, Headphones, Wrench } from "lucide-react";

const categories = [
  { label: "Laptops", icon: Laptop },
  { label: "Phones & Tablets", icon: Smartphone },
  { label: "Accessories", icon: Headphones },
  { label: "Repair Services", icon: Wrench },
];

export default function CategoryStrip() {
  return (
    <section className="border-y border-navy-900/10 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-navy-900/10 md:grid-cols-4">
        {categories.map((c) => (
          <a
            key={c.label}
            href="#shop"
            className="group flex flex-col items-center gap-2 px-6 py-8 text-center transition hover:bg-navy-900/[0.03]"
          >
            <c.icon className="h-6 w-6 text-navy-900" aria-hidden="true" />
            <span className="text-sm font-medium text-ink">{c.label}</span>
            <span className="h-0.5 w-0 bg-gold transition-all group-hover:w-8" />
          </a>
        ))}
      </div>
    </section>
  );
}
