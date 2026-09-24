"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  MapPin,
  Info,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { LoadingState } from "@/components/ApiState";
import { fetchProduct } from "@/lib/api/productsApi";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import type { PublicProduct, PublicVariant } from "@/lib/api/contracts";
import type { AppDispatch, RootState } from "@/lib/redux/store";

// Helper Functions
function variantLabel(variant: PublicVariant) {
  const attributeText = Object.entries(variant.attributes ?? {})
    .map(([key, value]) => key + ": " + String(value))
    .join(", ");
  return [variant.condition.replaceAll("_", " "), attributeText]
    .filter(Boolean)
    .join(" — ");
}

function isPurchasable(variant: PublicVariant | null) {
  return (
    variant?.availability === "in_stock" ||
    variant?.availability === "low_stock"
  );
}

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state);
  const isAuthenticated = store.auth.isAuthenticated;

  // Local State
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [state, setState] = useState<
    "loading" | "ready" | "error" | "not_found"
  >("loading");
  const [message, setMessage] = useState<string | null>(null);

  // UI State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Data Fetching
  const load = useCallback(async () => {
    try {
      const data = await fetchProduct(id);
      setProduct(data);
      const first = data.variants[0];
      setSelectedAttributes(
        first
          ? Object.fromEntries(
              Object.entries(first.attributes ?? {}).map(([key, value]) => [
                key,
                String(value),
              ]),
            )
          : {},
      );
      setState("ready");
    } catch {
      setState("not_found");
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // Variant Logic
  const attributeKeys = useMemo(() => {
    if (!product) return [];
    const keys = new Set<string>();
    product.variants.forEach((variant) =>
      Object.keys(variant.attributes ?? {}).forEach((key) => keys.add(key)),
    );
    return Array.from(keys);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) =>
        attributeKeys.every(
          (key) =>
            String(variant.attributes?.[key] ?? "") ===
            (selectedAttributes[key] ?? ""),
        ),
      ) ?? null
    );
  }, [attributeKeys, product, selectedAttributes]);

  const availableValues = useCallback(
    (key: string) => {
      if (!product) return [];
      const values = new Set<string>();
      product.variants.forEach((variant) => {
        const matchesOthers = attributeKeys
          .filter((candidate) => candidate !== key)
          .every(
            (candidate) =>
              String(variant.attributes?.[candidate] ?? "") ===
              (selectedAttributes[candidate] ?? ""),
          );
        if (matchesOthers && variant.attributes?.[key] != null)
          values.add(String(variant.attributes[key]));
      });
      return Array.from(values);
    },
    [attributeKeys, product, selectedAttributes],
  );

  // Handlers
  const handlePurchase = async () => {
    if (!selectedVariant || !isPurchasable(selectedVariant)) return;
    try {
      // Loop for quantity (assuming addGadgetToCart handles 1 unit per dispatch in your current setup)
      for (let i = 0; i < quantity; i++) {
        await addGadgetToCart({
          product: product!,
          variant: selectedVariant,
          isAuthenticated,
          dispatch,
          getState: () => store,
        });
      }
      setMessage(`Added ${quantity} item(s) to your cart.`);
      setQuantity(1); // Reset
    } catch {
      setMessage("We could not add that item. Please try again.");
    }
  };

  // --- RENDER BLOCKS ---

  if (state === "loading") {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">
          <LoadingState>Loading product details…</LoadingState>
        </main>
      </>
    );
  }

  if (state === "not_found" || !product) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center bg-white">
          <div className="mx-auto max-w-7xl px-6 w-full">
            <p className="text-[10px] font-extrabold tracking-widest text-gold uppercase">
              Sanfaani Store
            </p>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-navy-900 md:text-6xl">
              Product not found.
            </h1>
            <p className="mt-4 text-slate-500">
              The device you're looking for may no longer be available.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-bold text-navy-900 transition-colors hover:text-gold"
            >
              <ArrowLeft size={16} />
              Back to shop
            </Link>
          </div>
        </main>
      </>
    );
  }

  const isService =
    product.category.toLowerCase().includes("service") ||
    product.tags?.includes("service");
  const mainImage = product.images[activeImageIndex] || product.images[0];
  const activePrice = selectedVariant ? selectedVariant.price : 0;
  const formattedPrice = `₣ ${activePrice.toLocaleString("en-US")}`;
  const conditionDisplay =
    selectedVariant?.condition.replaceAll("_", " ") || "Select variant";

  return (
    <>
      <Navbar />
      <main className="bg-white pb-24 font-sans text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <div className="flex min-h-[70px] items-center gap-2 border-b border-slate-100 text-[11px] text-slate-400 overflow-hidden whitespace-nowrap">
            <Link
              href="/shop"
              className="transition-colors hover:text-navy-900"
            >
              Shop
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-navy-900 capitalize">
              {product.category}
            </span>
            <ChevronRight size={14} />
            <span className="font-semibold text-navy-900 truncate">
              {product.name}
            </span>
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-12 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[72px]">
            {/* LEFT: GALLERY */}
            <div className="flex flex-col gap-2">
              <div className="relative flex h-[430px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 md:h-[560px] lg:h-[650px]">
                {/* Badges */}
                {selectedVariant && (
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-navy-900 shadow-sm capitalize">
                    {selectedVariant.condition.replace(/_/g, " ")}
                  </span>
                )}
                <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-lg border border-slate-200/50 bg-white/90 px-3 py-2.5 text-[10px] font-bold text-emerald-500 shadow-sm backdrop-blur-md">
                  <Check size={14} strokeWidth={3} />
                  Information verified
                </div>

                {/* Main Image */}
                <div className="relative h-full w-full">
                  {mainImage && !imageError ? (
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-contain p-12"
                      priority
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image available
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:grid-cols-5">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex h-[70px] w-full items-center justify-center overflow-hidden rounded-lg border transition-colors ${
                        activeImageIndex === idx
                          ? "border-navy-900 ring-1 ring-navy-900"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: INFO & PURCHASE */}
            <div className="pt-3 lg:pt-5">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold">
                {product.brand || "Sanfaani"} · {product.category}
              </div>

              <h1 className="mt-3 max-w-[600px] font-display text-[42px] font-bold leading-[0.98] tracking-tight text-navy-900 md:text-5xl lg:text-6xl">
                {product.name}
              </h1>

              <p className="mt-5 max-w-[510px] text-sm leading-[1.7] text-slate-500">
                {product.description}
              </p>

              <div className="mt-6 text-[26px] font-extrabold tracking-tight text-navy-900">
                {selectedVariant ? formattedPrice : "Select options"}
              </div>

              {selectedVariant && (
                <div className="mt-2.5 flex items-center gap-2 text-[11px] font-bold text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {selectedVariant.availability
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              )}

              <div className="my-7 h-px bg-slate-100" />

              {/* VARIANT SELECTORS */}
              {attributeKeys.length > 0 && (
                <div className="mb-8 space-y-5">
                  {attributeKeys.map((key) => (
                    <div key={key}>
                      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900">
                        {key}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {availableValues(key).map((value) => {
                          const active = selectedAttributes[key] === value;
                          const variantExists = product.variants.some(
                            (v) =>
                              String(v.attributes?.[key] ?? "") === value &&
                              isPurchasable(v),
                          );
                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={!variantExists}
                              onClick={() =>
                                setSelectedAttributes((curr) => ({
                                  ...curr,
                                  [key]: value,
                                }))
                              }
                              className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-40 ${
                                active
                                  ? "border-navy-900 bg-navy-900 text-white"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DETAIL BLOCKS */}
              <div className="space-y-0">
                {/* 01 Condition */}
                <section className="border-b border-slate-100 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">
                        01
                      </span>
                      <h2 className="text-sm font-bold tracking-tight text-navy-900">
                        Condition
                      </h2>
                    </div>
                    <Info size={17} className="text-slate-400" />
                  </div>
                  <div className="mt-4 flex gap-3.5 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100/50 text-emerald-500">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-navy-900 capitalize">
                        {conditionDisplay} device
                      </strong>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {selectedVariant?.limitations
                          ? `Limitations: ${selectedVariant.limitations}`
                          : "Product condition and relevant limitations should be reviewed before purchase."}
                      </p>
                    </div>
                  </div>
                </section>

                {/* 02 Warranty */}
                <section className="border-b border-slate-100 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">
                      02
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-navy-900">
                      Warranty & support
                    </h2>
                  </div>
                  <div className="mt-4 flex gap-3 pl-1">
                    <ShieldCheck size={18} className="shrink-0 text-gold" />
                    <div>
                      <strong className="text-xs font-bold text-navy-900">
                        {selectedVariant?.warranty
                          ? `Covered by Warranty (${selectedVariant.warranty.version})`
                          : "Standard Support"}
                      </strong>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {selectedVariant?.warranty?.terms ||
                          "Support is available according to Sanfaani's applicable warranty terms."}
                      </p>
                    </div>
                  </div>
                </section>

                {/* 03 Fulfillment */}
                <section className="border-b border-slate-100 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">
                      03
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-navy-900">
                      Fulfillment
                    </h2>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="flex gap-3 rounded-xl border border-slate-200 p-3.5">
                      <Truck size={18} className="shrink-0 text-navy-900" />
                      <div>
                        <strong className="text-xs font-bold text-navy-900">
                          Delivery
                        </strong>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                          Delivery availability confirmed at checkout.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl border border-slate-200 p-3.5">
                      <MapPin size={18} className="shrink-0 text-navy-900" />
                      <div>
                        <strong className="text-xs font-bold text-navy-900">
                          Pickup
                        </strong>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                          Pickup depends on location and stock.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* PURCHASE BLOCK */}
              <div className="mt-8 grid gap-2.5 sm:grid-cols-[105px_1fr]">
                <div className="flex h-[52px] items-center justify-between rounded-xl border border-slate-200 px-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-full w-9 items-center justify-center text-navy-900 transition-colors hover:text-gold"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xs font-bold text-navy-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-full w-9 items-center justify-center text-navy-900 transition-colors hover:text-gold"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={
                    !selectedVariant ||
                    !isPurchasable(selectedVariant) ||
                    isService
                  }
                  onClick={handlePurchase}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-navy-900 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold hover:text-navy-900 hover:shadow-lg hover:shadow-gold/20 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ShoppingCart size={18} />
                  {isService
                    ? "Request service"
                    : isPurchasable(selectedVariant)
                      ? "Add to cart"
                      : "Unavailable"}
                </button>
              </div>

              {message && (
                <p className="mt-3 text-center text-[11px] font-medium text-emerald-600">
                  {message}
                </p>
              )}
              <p className="mt-3 text-center text-[10px] text-slate-400">
                Secure checkout • Hassle-free returns
              </p>
            </div>
          </div>

          {/* SPECIFICATIONS GRID */}
          <section className="mt-24 grid gap-12 border-t border-slate-200 pt-16 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-gold uppercase">
                Product Details
              </p>
              <h2 className="mt-2 text-[34px] font-bold tracking-tight text-navy-900">
                What you're getting.
              </h2>
            </div>

            <div className="grid grid-cols-2 border-l border-t border-slate-200">
              <div className="flex min-h-[100px] flex-col justify-center border-b border-r border-slate-200 p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Category
                </span>
                <strong className="mt-1.5 text-[13px] text-navy-900 capitalize">
                  {product.category}
                </strong>
              </div>
              <div className="flex min-h-[100px] flex-col justify-center border-b border-slate-200 p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Condition
                </span>
                <strong className="mt-1.5 text-[13px] text-navy-900 capitalize">
                  {conditionDisplay}
                </strong>
              </div>
              <div className="flex min-h-[100px] flex-col justify-center border-b border-r border-slate-200 p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Availability
                </span>
                <strong className="mt-1.5 text-[13px] text-navy-900 capitalize">
                  {selectedVariant?.availability.replace(/_/g, " ") ||
                    "Select variant"}
                </strong>
              </div>
              <div className="flex min-h-[100px] flex-col justify-center border-b border-slate-200 p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Warranty
                </span>
                <strong className="mt-1.5 text-[13px] text-navy-900">
                  {selectedVariant?.warranty
                    ? selectedVariant.warranty.version
                    : "Standard"}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
