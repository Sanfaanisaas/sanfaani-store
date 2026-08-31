"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Wrench,
  Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { EmptyState, LoadingState } from "@/components/ApiState";
import { fetchProduct } from "@/lib/api/productsApi";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import type {
  PublicProduct,
  PublicVariant,
  ProductCondition,
} from "@/lib/api/contracts";
import type { AppDispatch, RootState } from "@/lib/redux/store";

function formatConditionLabel(condition?: ProductCondition): string {
  if (!condition) return "Standard";
  switch (condition) {
    case "new":
      return "Brand New";
    case "refurbished_grade_a":
      return "Refurbished — Grade A (Pristine)";
    case "refurbished_grade_b":
      return "Refurbished — Grade B (Light Signs of Use)";
    case "used_grade_a":
      return "Used — Grade A (Excellent)";
    case "used_grade_b":
      return "Used — Grade B (Fair)";
    default:
      return String(condition).replaceAll("_", " ");
  }
}

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugOrId } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PublicVariant | null>(
    null,
  );
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "not_found">(
    "loading",
  );
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchProduct(slugOrId);
      setProduct(data);

      const firstVariant = data.variants[0] ?? null;
      setSelectedVariant(firstVariant);

      if (firstVariant) {
        const initialAttrs: Record<string, string> = {
          condition: firstVariant.condition,
        };
        Object.entries(firstVariant.attributes || {}).forEach(([k, v]) => {
          initialAttrs[k] = String(v);
        });
        setSelectedAttributes(initialAttrs);
      }

      setState("ready");
    } catch {
      setState("not_found");
    }
  }, [slugOrId]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!ignore) {
        await load();
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [load]);

  // Extract all distinct attribute keys across all variants
  const attributeKeys = useMemo(() => {
    if (!product) return [];
    const keys = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [product]);

  // Extract all distinct options for each attribute key
  const attributeOptions = useMemo(() => {
    if (!product) return {};
    const optionsMap: Record<string, Set<string>> = {};

    // Include condition as a configurable matrix dimension
    optionsMap.condition = new Set(product.variants.map((v) => v.condition));

    attributeKeys.forEach((key) => {
      optionsMap[key] = new Set<string>();
      product.variants.forEach((v) => {
        if (v.attributes && v.attributes[key] !== undefined) {
          optionsMap[key].add(String(v.attributes[key]));
        }
      });
    });

    return optionsMap;
  }, [product, attributeKeys]);

  // Handle attribute selection and matrix resolution
  function handleSelectAttribute(key: string, value: string) {
    if (!product) return;
    const nextAttrs = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(nextAttrs);

    // Find the closest matching variant
    const matched = product.variants.find((v) => {
      if (nextAttrs.condition && v.condition !== nextAttrs.condition) {
        return false;
      }
      return attributeKeys.every((attrKey) => {
        if (!nextAttrs[attrKey]) return true;
        return String(v.attributes?.[attrKey]) === nextAttrs[attrKey];
      });
    });

    if (matched) {
      setSelectedVariant(matched);
    } else {
      // Fallback: match by the single clicked attribute
      const fallbackMatch = product.variants.find((v) =>
        key === "condition"
          ? v.condition === value
          : String(v.attributes?.[key]) === value,
      );
      if (fallbackMatch) {
        setSelectedVariant(fallbackMatch);
      }
    }
    setMessage(null);
  }

  // Check if an attribute option is available in the current matrix
  function isOptionAvailable(key: string, value: string): boolean {
    if (!product) return false;
    return product.variants.some((v) => {
      if (key === "condition") {
        return v.condition === value && v.availability !== "out_of_stock";
      }
      return (
        String(v.attributes?.[key]) === value &&
        v.availability !== "out_of_stock"
      );
    });
  }

  if (state === "loading") {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <LoadingState>Loading catalogue item...</LoadingState>
        </main>
      </>
    );
  }

  if (state === "not_found" || !product) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <EmptyState title="Product Not Found">
            The requested device or repair service could not be found.
            <div className="mt-4">
              <Link href="/shop" className="font-semibold text-blue underline">
                Back to Catalogue
              </Link>
            </div>
          </EmptyState>
        </main>
      </>
    );
  }

  const isAvailable =
    selectedVariant?.availability === "in_stock" ||
    selectedVariant?.availability === "low_stock";
  const isSourcing = selectedVariant?.availability === "sourcing";
  const isService =
    product.category.toLowerCase().includes("service") ||
    product.tags?.includes("service");
  const isBundle =
    product.category.toLowerCase().includes("bundle") ||
    product.tags?.includes("bundle");

  const images = product.images?.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex];

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm text-mist"
        >
          <Link href="/shop" className="hover:text-navy-900 underline">
            Catalogue
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-ink font-medium">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 rounded-3xl border border-navy-900/10 bg-white p-6 md:p-8">
          {/* Gallery Media Column */}
          <div className="flex flex-col gap-4">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-paper">
              {currentImage && !imageError ? (
                <Image
                  src={currentImage}
                  alt={`${product.name} visual reference`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-navy-900/30">
                  {isService ? (
                    <Wrench size={64} />
                  ) : isBundle ? (
                    <Layers size={64} />
                  ) : (
                    <Package size={64} />
                  )}
                  <span className="mt-2 text-sm font-medium text-mist">
                    No image available
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                {isService && (
                  <span className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Repair Service
                  </span>
                )}
                {isBundle && (
                  <span className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Curated Bundle
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setImageError(false);
                    }}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-paper transition ${
                      activeImageIndex === idx
                        ? "border-gold"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Inspection & Evidence Summary Card */}
            {selectedVariant && selectedVariant.condition !== "new" && (
              <div className="rounded-2xl border border-navy-900/10 bg-navy-900/5 p-4 text-sm">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Sanfaani Inspection Summary
                </h3>
                <p className="mt-1 text-mist">
                  Graded as{" "}
                  <strong className="text-ink">
                    {formatConditionLabel(selectedVariant.condition)}
                  </strong>
                  . Fully tested across battery health, display responsiveness,
                  audio, and network connectivity.
                </p>
                {selectedVariant.limitations && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-amber-900 text-xs">
                    <AlertTriangle
                      size={16}
                      className="flex-shrink-0 mt-0.5 text-amber-700"
                    />
                    <div>
                      <strong className="block font-semibold">
                        Known Physical Notes:
                      </strong>
                      {selectedVariant.limitations}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product & Variant Selection Column */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-mist">
                <span>{product.brand}</span>
                <span>SKU: {selectedVariant?.sku || "N/A"}</span>
              </div>

              <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold text-ink">
                {product.name}
              </h1>

              <p className="mt-3 text-sm md:text-base leading-relaxed text-mist">
                {product.description}
              </p>

              {/* Condition Matrix Option */}
              {attributeOptions.condition &&
                attributeOptions.condition.size > 0 && (
                  <fieldset className="mt-6">
                    <legend className="text-xs font-bold uppercase tracking-wider text-mist">
                      Condition
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.from(attributeOptions.condition).map((cond) => {
                        const isSelected =
                          (selectedAttributes.condition ??
                            selectedVariant?.condition) === cond;
                        const inStock = isOptionAvailable("condition", cond);
                        return (
                          <button
                            key={cond}
                            type="button"
                            onClick={() =>
                              handleSelectAttribute("condition", cond)
                            }
                            aria-pressed={isSelected}
                            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                              isSelected
                                ? "border-navy-900 bg-navy-900 text-white shadow-sm"
                                : "border-navy-900/15 bg-white text-ink hover:border-navy-900/40"
                            } ${!inStock ? "opacity-40" : ""}`}
                          >
                            {formatConditionLabel(cond as ProductCondition)}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

              {/* Dynamic Variant Attributes (Storage, Color, RAM, etc.) */}
              {attributeKeys.map((key) => {
                const options = Array.from(attributeOptions[key] || []);
                if (options.length === 0) return null;
                return (
                  <fieldset key={key} className="mt-4">
                    <legend className="text-xs font-bold uppercase tracking-wider text-mist capitalize">
                      {key}
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {options.map((val) => {
                        const isSelected = selectedAttributes[key] === val;
                        const inStock = isOptionAvailable(key, val);
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSelectAttribute(key, val)}
                            aria-pressed={isSelected}
                            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                              isSelected
                                ? "border-navy-900 bg-navy-900 text-white shadow-sm"
                                : "border-navy-900/15 bg-white text-ink hover:border-navy-900/40"
                            } ${!inStock ? "opacity-40" : ""}`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              {/* Warranty Coverage Pill */}
              {selectedVariant?.warranty && (
                <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-emerald-900/15 bg-emerald-500/5 p-3.5 text-xs text-emerald-950">
                  <ShieldCheck
                    size={18}
                    className="text-emerald-700 flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold block">
                      Warranty: {selectedVariant.warranty.version}
                    </span>
                    <span className="text-emerald-800">
                      {selectedVariant.warranty.terms}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Price & Checkout Call to Action */}
            <div className="mt-8 border-t border-navy-900/10 pt-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-mist">Price</span>
                  <p className="font-display text-3xl font-bold text-ink">
                    {selectedVariant
                      ? `₦${selectedVariant.price.toLocaleString("en-NG")}`
                      : "Unavailable"}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-mist">Stock Status</span>
                  <p className="text-sm font-semibold capitalize text-ink flex items-center gap-1 justify-end">
                    {isSourcing && (
                      <Clock size={14} className="text-amber-600" />
                    )}
                    {selectedVariant?.availability.replaceAll("_", " ") ??
                      "Out of stock"}
                  </p>
                </div>
              </div>

              {message && (
                <div
                  role="status"
                  className={`mt-4 rounded-xl p-3 text-sm font-medium ${
                    message.error
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={!selectedVariant || (!isAvailable && !isSourcing)}
                  onClick={() => {
                    if (!selectedVariant) return;
                    void addGadgetToCart({
                      product,
                      variant: selectedVariant,
                      isAuthenticated,
                      dispatch,
                    })
                      .then(() =>
                        setMessage({
                          text: "Added to your cart successfully!",
                        }),
                      )
                      .catch(() =>
                        setMessage({
                          text: "Could not add item to cart. Please try again.",
                          error: true,
                        }),
                      );
                  }}
                  className="w-full rounded-full bg-gold py-3.5 font-semibold text-navy-900 shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSourcing ? "Order Sourcing Item" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
