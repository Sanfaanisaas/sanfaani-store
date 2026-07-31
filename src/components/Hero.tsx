import ProductCard from "./ProductCard";
import { mockGadgets } from "@/lib/mockData/gadgets";

export default function Hero() {
  const featured = mockGadgets.slice(0, 2);

  return (
    <section className="bg-navy-900 text-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Sanfaani Store & Repair
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Better tech.
            <br />
            Less stress.
          </h1>
          <p className="mt-6 max-w-md text-paper/70">
            Shop real devices with honest condition and warranty. Repair with
            an approved quote and a fully tracked handover — every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="shop" className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-900 hover:bg-gold/90">
              Browse devices
            </a>
            <a href="#waitlist" className="rounded-full border border-paper/30 px-6 py-3 text-sm font-medium text-paper hover:bg-paper/10">
              Join the waitlist
            </a>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 rounded-3xl bg-gold/10" />
          <div className="relative flex flex-col gap-6 py-4">
            {featured.map((g, i) => (
              <div key={g.id} className={i === 0 ? "-rotate-2" : "translate-x-8 rotate-2"}>
                <ProductCard gadget={g} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}