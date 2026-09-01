import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedGadgets from "@/components/FeaturedGadgets";
import RepairProcess from "@/components/RepairProcess";
import TrustBand from "@/components/TrustBand";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="bg-paper">
      <Navbar />
      <Hero />
      <FeaturedGadgets />
      <RepairProcess />
      <TrustBand />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Ready to get started?
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Experience reliable tech support and verified devices
          </h2>
          <p className="mt-3 text-mist">
            Explore our condition-checked catalogue, schedule a professional diagnostic repair, or request a tailored enterprise quote.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-gold/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Browse Catalogue
            </Link>
            <Link
              href="/repair/request"
              className="rounded-full border border-navy-900/20 bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Book a Repair
            </Link>
            <Link
              href="/guidance"
              className="rounded-full border border-navy-900/20 bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Device Guidance
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}