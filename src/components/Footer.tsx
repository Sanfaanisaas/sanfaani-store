import Link from "next/link";

const columns = [
  { heading: "Shop", links: ["Laptops", "Phones & Tablets", "Accessories", "Device Guidance"] },
  { heading: "Repair", links: ["Request a Repair", "Track a Repair", "Warranty & Returns"] },
  { heading: "Company", links: ["About Sanfaani", "Business & Schools", "Buyer Guides"] },
  { heading: "Support", links: ["Contact Us", "Terms of Sale", "Privacy Notice"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold/30 bg-navy-900 text-paper">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display text-sm font-semibold text-gold">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="hover:text-paper">{link}</Link>
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
            <Link href="#" className="hover:text-paper">Terms</Link>
            <Link href="#" className="hover:text-paper">Privacy</Link>
            <Link href="#" className="hover:text-paper">Warranty</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}