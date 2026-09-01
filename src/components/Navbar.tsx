"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useActivePath } from "@/lib/hooks/useActivePath";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { selectCartItems } from "@/lib/redux/slices/cartSlice";
import type { RootState } from "@/lib/redux/store";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/redux/store";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();
  const { isActive } = useActivePath();
  const pathname = usePathname();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useFocusTrap(isMenuOpen, drawerRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Repair", href: "/repair/request" },
    { label: "Track order", href: "/orders/track" },
    { label: "Support", href: "/support" },
  ];

  function linkClass(href: string, exact = false) {
    const active = isActive(href, exact);
    return [
      "transition-colors",
      active ? "text-paper font-semibold" : "text-paper/80 hover:text-paper",
    ].join(" ");
  }

  return (
    <header className="sticky top-0 z-50 bg-navy-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-paper" aria-current={isActive("/", true) ? "page" : undefined}>
          Sanfaani<span className="text-gold">.</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={linkClass(link.href, link.href === "/")}
              aria-current={isActive(link.href, link.href === "/") ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative rounded-lg p-1.5 text-paper/80 hover:bg-white/10 hover:text-paper" aria-label={"Cart" + (items.length ? ", " + items.length + " items" : "")}>
            <ShoppingCart size={20} />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy-900">
                {items.length}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link href="/account" className="inline-flex items-center gap-1 text-sm font-medium text-paper/90 hover:text-paper">
                  <User size={16} />
                  {user?.name?.split(" ")[0] ?? "Account"}
                </Link>
                <button
                  type="button"
                  onClick={() => void dispatch(logoutUser()).then(() => router.push("/"))}
                  className="text-sm font-medium text-paper/80 hover:text-paper"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-paper/90 hover:text-paper">
                  Log in
                </Link>
                <Link href="/register" className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-navy-900 hover:bg-gold/90">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-lg p-1.5 text-paper/80 hover:bg-white/10 hover:text-paper md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls={drawerId}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[60px] z-40 bg-navy-900/60 backdrop-blur-sm motion-reduce:backdrop-blur-none md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id={drawerId}
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed top-[60px] right-0 z-50 h-[calc(100vh-60px)] w-64 bg-navy-900 p-6 shadow-xl motion-reduce:transition-none md:hidden"
          >
            <nav className="flex flex-col gap-6" aria-label="Mobile primary">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={"text-lg font-medium " + linkClass(link.href, link.href === "/")}
                  aria-current={isActive(link.href, link.href === "/") ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" className={"text-lg font-medium " + linkClass("/cart")} onClick={() => setIsMenuOpen(false)}>
                Cart{items.length ? " (" + items.length + ")" : ""}
              </Link>
              <hr className="border-paper/10" />
              {isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <Link href="/account" className="text-lg font-medium text-paper/80 hover:text-paper" onClick={() => setIsMenuOpen(false)}>
                    My account
                  </Link>
                  <button
                    type="button"
                    className="text-left text-lg font-medium text-paper/80 hover:text-paper"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void dispatch(logoutUser()).then(() => router.push("/"));
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" className="text-lg font-medium text-paper/80 hover:text-paper" onClick={() => setIsMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/register" className="inline-block rounded-xl bg-gold px-6 py-3 text-center text-sm font-bold text-navy-900 hover:bg-gold/90" onClick={() => setIsMenuOpen(false)}>
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
