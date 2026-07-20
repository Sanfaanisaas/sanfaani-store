import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedGadgets from "@/components/FeaturedGadgets";
import RepairProcess from "@/components/RepairProcess";
import TrustBand from "@/components/TrustBand";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import CategoryStrip from "@/components/CategoryStrip";

export default function HomePage() {
  return (
    <main className="bg-paper">
      <Navbar />
      <Hero />
      <CategoryStrip />
      <FeaturedGadgets />
      <RepairProcess />
      <TrustBand />
      <section id="waitlist" className="bg-paper py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Coming soon
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Join the waitlist
          </h2>
          <p className="mt-3 text-mist">
            Be first to shop and book repairs when we launch.
          </p>
          <div className="mt-10">
            <WaitlistForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}