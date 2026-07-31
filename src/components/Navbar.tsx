"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Repair", href: "/repair/request" },
    { label: "Waitlist", href: "/#waitlist" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-paper">
          Sanfaani<span className="text-gold">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm text-paper/80 md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-paper">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-1.5 text-paper/80 hover:bg-white/10 hover:text-paper md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[60px] z-40 bg-navy-900/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-[60px] right-0 z-50 h-[calc(100vh-60px)] w-64 transform bg-navy-900 p-6 shadow-xl transition-transform md:hidden">
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-paper/80 hover:text-paper"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-paper/10" />
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  className="text-lg font-medium text-paper/80 hover:text-paper"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-block rounded-xl bg-gold px-6 py-3 text-center text-sm font-bold text-navy-900 hover:bg-gold/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}