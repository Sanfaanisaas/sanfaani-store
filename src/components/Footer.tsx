import Link from "next/link";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "Laptops", href: "/shop" },
      { label: "Phones & Tablets", href: "/shop" },
      { label: "Accessories", href: "/shop" },
    ],
  },
  {
    heading: "Repair",
    links: [
      { label: "Request a Repair", href: "/repair/request" },
      { label: "Track a Repair", href: "/repair/track" },
      { label: "Track an Order", href: "/orders/track" },
      { label: "Warranty", href: "/policies/warranty" },
      { label: "Returns", href: "/policies/returns" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", href: "/support" },
      { label: "Terms of Sale", href: "/policies/terms" },
      { label: "Privacy Notice", href: "/policies/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold/30 bg-navy-900 text-paper">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display text-sm font-semibold text-gold">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-paper">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-8 sm:flex-row">
          <Link href="/" className="font-display text-lg font-semibold text-paper">
            Sanfaani<span className="text-gold">.</span>
          </Link>
          <p className="text-xs text-paper/50">
            © {new Date().getFullYear()} Sanfaani LTD. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-paper/50">
            <Link href="/policies/terms" className="hover:text-paper">
              Terms
            </Link>
            <Link href="/policies/privacy" className="hover:text-paper">
              Privacy
            </Link>
            <Link href="/policies/warranty" className="hover:text-paper">
              Warranty
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}