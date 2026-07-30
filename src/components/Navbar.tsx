import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-navy-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-paper">
          Sanfaani<span className="text-gold">.</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-paper/80 md:flex">
          <a href="/shop" className="hover:text-paper">Shop</a>
          <a href="#repair" className="hover:text-paper">Repair</a>
          <a href="#waitlist" className="hover:text-paper">Waitlist</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-paper/90 hover:text-paper">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-navy-900 hover:bg-gold/90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}