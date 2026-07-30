"use client";

import Link from "next/link";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Package } from "lucide-react";
import { mockGadgets } from "@/lib/mockData/gadgets";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import type { AppDispatch, RootState } from "@/lib/redux/store";

export default function CardDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleAddToCart = (gadget: (typeof mockGadgets)[number]) => {
    addGadgetToCart({ gadget, isAuthenticated, dispatch });
  };

  const gadget = mockGadgets.find((item) => item.id === resolvedParams.id);

  if (!gadget) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Product unavailable</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink">We could not find this gadget.</h1>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-900">
              Back to shop
            </Link>
          </div>
        </main>
      </>
    );
  }

  const similarProducts = mockGadgets.filter(
    (item) => item.category === gadget.category && item.id !== gadget.id
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/shop" className="mb-6 inline-flex items-center text-sm font-semibold text-blue hover:text-gold">
          ← Back to catalogue
        </Link>

        <section className="overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col items-center justify-center p-8 sm:p-10 lg:p-12">
              <div className="flex h-64 w-full items-center justify-center rounded-3xl text-7xl text-navy-900/80">
                <Package className="h-16 w-16" />
              </div>
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
                  {gadget.name}
                </h1>
                <p className="mt-3 text-lg text-mist">{gadget.spec}</p>

                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <span className="rounded-full  px-3 py-1 text-xs font-semibold tracking-[0.24em] text-gold">
                    {gadget.condition}
                  </span>
                  <span className="rounded-full  px-3 py-1 text-xs font-semibold tracking-[0.24em] text-mist">
                    {gadget.status}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-navy-900/10 bg-paper p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue">Price</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-ink">
                        ₦{gadget.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(gadget)}
                      className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-navy-800"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-navy-900/10 p-4">
                    <p className="text-sm font-semibold text-ink">Condition</p>
                    <p className="mt-1 text-sm text-mist">{gadget.condition}</p>
                  </div>
                  <div className="rounded-2xl border border-navy-900/10 p-4">
                    <p className="text-sm font-semibold text-ink">Availability</p>
                    <p className="mt-1 text-sm text-mist">{gadget.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Similar products</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">More in {gadget.category}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} gadget={item} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
