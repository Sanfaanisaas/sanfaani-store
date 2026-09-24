"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useActivePath } from "@/lib/hooks/useActivePath";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { selectCartItems } from "@/lib/redux/slices/cartSlice";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import type { RootState, AppDispatch } from "@/lib/redux/store";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();
  const { isActive } = useActivePath();
  const pathname = usePathname();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

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

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-5 px-6 md:h-[76px] md:gap-10">
        {/* LOGO */}
        <div className="flex shrink-0 items-center">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-current={isActive("/", true) ? "page" : undefined}
          >
            <Image
              src="/logo.webp"
              alt="Sanfaani Logo"
              width={38}
              height={38}
              className="h-8.5 w-auto rounded object-contain md:h-9.5"
            />
            <span className="hidden font-display text-xl font-bold tracking-tight text-navy-900 sm:block"></span>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav
          className="ml-auto hidden items-center justify-center gap-[34px] md:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href, link.href === "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex items-center justify-center whitespace-nowrap text-[13px] font-semibold leading-none transition-colors
                  ${active ? "text-gold" : "text-navy-900 hover:text-gold"}
                  after:absolute after:-bottom-[9px] after:left-0 after:right-0 after:h-[2px] after:origin-center after:rounded-[10px] after:bg-gold after:transition-transform after:duration-300
                  ${active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center justify-end gap-[7px]">
          {/* Cart Icon Button */}
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-navy-900 transition-colors hover:bg-slate-100 hover:text-gold"
            aria-label={
              "Cart" + (items.length ? ", " + items.length + " items" : "")
            }
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            {items.length > 0 && (
              <span className="absolute right-[1px] top-[1px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[8px] font-extrabold leading-none text-navy-900">
                {items.length}
              </span>
            )}
          </Link>

          {/* User / Auth (Desktop) */}
          <div className="hidden items-center gap-[7px] md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-navy-900 transition-colors hover:bg-slate-100 hover:text-gold"
                  title={user?.name || "Account"}
                >
                  <User size={20} strokeWidth={2.5} />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    void dispatch(logoutUser()).then(() => router.push("/"))
                  }
                  className="relative inline-flex h-10 shrink-0 items-center justify-center rounded-full px-3 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-slate-100 hover:text-gold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="relative inline-flex h-10 shrink-0 items-center justify-center rounded-full px-3 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-slate-100 hover:text-gold"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="ml-2 inline-flex h-[38px] shrink-0 items-center justify-center rounded-full bg-gold px-5 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-gold/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls={drawerId}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-navy-900 transition-colors hover:bg-slate-100 hover:text-gold md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV (Expanding Dropdown) */}
      {isMenuOpen && (
        <div
          id={drawerId}
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          className="absolute left-0 top-full flex w-full flex-col border-t border-slate-200 bg-white px-5 pb-6 pt-3 shadow-xl md:hidden"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href, link.href === "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex min-h-[52px] items-center gap-3 border-b border-slate-100 text-[14px] font-semibold ${active ? "text-gold" : "text-navy-900 hover:text-gold"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="h-3" /> {/* Spacer */}
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="flex min-h-[52px] items-center gap-3 border-b border-slate-100 text-[14px] font-semibold text-navy-900 hover:text-gold"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} /> My Account
              </Link>
              <button
                type="button"
                className="flex min-h-[52px] items-center gap-3 text-left text-[14px] font-semibold text-navy-900 hover:text-gold"
                onClick={() => {
                  setIsMenuOpen(false);
                  void dispatch(logoutUser()).then(() => router.push("/"));
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-3">
              <Link
                href="/login"
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-navy-900 text-[14px] font-semibold text-navy-900 transition-colors hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-gold text-[14px] font-semibold text-navy-900 transition-colors hover:bg-gold/90"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Mobile Overlay to capture clicks outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-[68px] z-[-1] bg-navy-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
