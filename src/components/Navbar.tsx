"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Repair", href: "/repair/request" },
    { label: "Track", href: "/repair/track" },
    { label: "Orders", href: "/account/orders" },
  ];

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Handle Escape key and focus trapping inside mobile drawer
  useEffect(() => {
    if (!isMenuOpen) return;

    // Lock background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus the drawer
    const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements
      ? focusableElements[focusableElements.length - 1]
      : null;

    firstElement?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key === "Tab") {
        if (!focusableElements || focusableElements.length === 0) return;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-50 bg-navy-900 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Sanfaani<span className="text-gold">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden items-center gap-8 text-sm md:flex"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md px-1.5 py-0.5 ${
                  isActive
                    ? "font-semibold text-gold border-b-2 border-gold pb-0.5"
                    : "text-paper/80 hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-paper/90 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-navy-900 transition hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-1.5 text-paper/80 hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={isMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div id="mobile-nav-drawer">
          <div
            className="fixed inset-0 top-[60px] z-40 bg-navy-900/60 backdrop-blur-sm md:hidden motion-reduce:transition-none"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed top-[60px] right-0 z-50 h-[calc(100vh-60px)] w-72 bg-navy-900 p-6 shadow-2xl transition-transform duration-200 ease-out md:hidden motion-reduce:transition-none"
          >
            <nav className="flex flex-col gap-5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href ||
                      pathname.startsWith(link.href + "/");

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`text-base font-medium transition-colors ${
                      isActive
                        ? "font-bold text-gold"
                        : "text-paper/80 hover:text-paper"
                    }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <hr className="border-paper/10 my-1" />
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="text-base font-medium text-paper/80 hover:text-paper"
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-block rounded-xl bg-gold px-6 py-3 text-center text-sm font-bold text-navy-900 hover:bg-gold/90"
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
