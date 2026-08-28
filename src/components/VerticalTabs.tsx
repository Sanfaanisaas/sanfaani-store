interface VerticalTabsProps { activeCategory: string; onChange: (category: string) => void; }
const categories = ["All", "Laptops", "Phones & Tablets", "Accessories", "Repair Services"];
export default function VerticalTabs({ activeCategory, onChange }: VerticalTabsProps) { return <nav aria-label="Product categories" className="flex flex-wrap gap-2">{categories.map((category) => <button type="button" key={category} onClick={() => onChange(category)} aria-pressed={activeCategory === category} className="rounded-full border px-3 py-2 text-sm">{category}</button>)}</nav>; }
