import Link from "next/link";
import { ArrowRight, ShieldCheck, Wrench } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedGadgets from "@/components/FeaturedGadgets";
import RepairProcess from "@/components/RepairProcess";
import TrustBand from "@/components/TrustBand";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="bg-paper">
      <Navbar />
      <Hero />
      <FeaturedGadgets />
      <RepairProcess />
      <TrustBand />

      {/* Live Store CTA replacing obsolete launch-era waitlist */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Sanfaani Certified Store & Service
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-ink">
            Ready to upgrade or repair your device?
          </h2>
          <p className="mt-3 text-sm text-mist max-w-xl mx-auto">
            Browse our live inventory of verified refurbished devices with
            warranty coverage or book diagnostics with our engineers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800"
            >
              <ShieldCheck size={16} /> Browse Live Catalogue
            </Link>
            <Link
              href="/repair/request"
              className="inline-flex items-center gap-2 rounded-full border border-navy-900/20 bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-navy-900/5"
            >
              <Wrench size={16} /> Request Device Repair{" "}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
