"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, User, LogOut } from "lucide-react";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { logoutUser } from "@/lib/redux/slices/authSlice";

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Show "Orders" only when the user is logged in
  const navLinks = useMemo(() => {
    const links = [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Repair", href: "/repair/request" },
      { label: "Track", href: "/repair/track" },
    ];

    if (isAuthenticated) {
      links.push({ label: "Orders", href: "/account/orders" });
    }

    return links;
  }, [isAuthenticated]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  function handleLogout() {
    void dispatch(logoutUser());
    closeMenu();
  }

  // Handle Escape key and focus trapping inside mobile drawer
  useEffect(() => {
    if (!isMenuOpen) return;

    // Lock background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus the first element in drawer
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
          {/* Desktop Auth Controls */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1.5 text-xs font-semibold text-paper/90 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md px-2 py-1"
                >
                  <User size={14} className="text-gold" />
                  <span>{user?.name?.split(" ")[0] || "Account"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="flex items-center gap-1 text-xs text-mist hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
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

              {/* Mobile Auth Controls */}
              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <p className="text-xs text-mist">
                      Signed in as{" "}
                      <strong className="text-paper">
                        {user?.name || user?.email}
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-center text-sm font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
