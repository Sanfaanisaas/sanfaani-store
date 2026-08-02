"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Package, Loader2 } from "lucide-react";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import type { AppDispatch, RootState } from "@/lib/redux/store";

export default function CardDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [gadget, setGadget] = useState<any | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${resolvedParams.id}`);
        const result = await response.json();
        if (result.success) {
          setGadget(result.data);
          
          // Fetch similar products (simple category filter on all products for now)
          const allRes = await fetch("/api/products");
          const allResult = await allRes.json();
          if (allResult.success) {
            setSimilarProducts(
              (allResult.data.products ?? allResult.data).filter((item: any) => 
                item.category === result.data.category && (item.id || item._id) !== resolvedParams.id
              )
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [resolvedParams.id]);

  const handleAddToCart = (gadget: any) => {
    addGadgetToCart({ gadget, isAuthenticated, dispatch });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-16 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-mist mb-4" />
          <p className="text-mist">Loading product details...</p>
        </main>
      </>
    );
  }

  if (!gadget && !loading) {
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
                {gadget.images?.[0] ? (
                  <img src={gadget.images[0]} alt={gadget.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="h-16 w-16" />
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
                  {gadget.name}
                </h1>
                <p className="mt-3 text-lg text-mist">{gadget.description || gadget.spec}</p>

                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <span className="rounded-full  px-3 py-1 text-xs font-semibold tracking-[0.24em] text-gold">
                    {gadget.condition || "NEW"}
                  </span>
                  <span className="rounded-full  px-3 py-1 text-xs font-semibold tracking-[0.24em] text-mist">
                    {gadget.in_stock ? "AVAILABLE" : "OUT OF STOCK"}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-navy-900/10 bg-paper p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue">Price</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-ink">
                        ₦{(gadget.variants?.[0]?.price || gadget.price || 0).toLocaleString()}
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
                    <p className="mt-1 text-sm text-mist">{gadget.condition || "NEW"}</p>
                  </div>
                  <div className="rounded-2xl border border-navy-900/10 p-4">
                    <p className="text-sm font-semibold text-ink">Availability</p>
                    <p className="mt-1 text-sm text-mist">{gadget.in_stock ? "In Stock" : "Out of Stock"}</p>
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
              <ProductCard key={item.id || item._id} gadget={item} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
