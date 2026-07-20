const categories = [
  { label: "Laptops", icon: "💻" },
  { label: "Phones & Tablets", icon: "📱" },
  { label: "Accessories", icon: "🎧" },
  { label: "Repair Services", icon: "🛠️" },
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
            <span className="text-2xl">{c.icon}</span>
            <span className="text-sm font-medium text-ink">{c.label}</span>
            <span className="h-0.5 w-0 bg-gold transition-all group-hover:w-8" />
          </a>
        ))}
      </div>
    </section>
  );
}
