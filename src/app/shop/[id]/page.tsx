"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import { EmptyState, LoadingState } from "@/components/ApiState";
import { fetchProduct } from "@/lib/api/productsApi";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import type { PublicProduct, PublicVariant } from "@/lib/api/contracts";
import type { AppDispatch, RootState } from "@/lib/redux/store";

function variantLabel(variant: PublicVariant) {
  const attributeText = Object.entries(variant.attributes ?? {})
    .map(([key, value]) => key + ": " + String(value))
    .join(", ");
  return [variant.condition.replaceAll("_", " "), attributeText].filter(Boolean).join(" — ");
}

function isPurchasable(variant: PublicVariant | null) {
  return variant?.availability === "in_stock" || variant?.availability === "low_stock";
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state);
  const isAuthenticated = store.auth.isAuthenticated;
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [state, setState] = useState<"loading" | "ready" | "error" | "not_found">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchProduct(id);
      setProduct(data);
      const first = data.variants[0];
      setSelectedAttributes(first ? Object.fromEntries(Object.entries(first.attributes ?? {}).map(([key, value]) => [key, String(value)])) : {});
      setState("ready");
    } catch {
      setState("not_found");
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const attributeKeys = useMemo(() => {
    if (!product) return [];
    const keys = new Set<string>();
    product.variants.forEach((variant) => Object.keys(variant.attributes ?? {}).forEach((key) => keys.add(key)));
    return Array.from(keys);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((variant) =>
      attributeKeys.every((key) => String(variant.attributes?.[key] ?? "") === (selectedAttributes[key] ?? "")),
    ) ?? null;
  }, [attributeKeys, product, selectedAttributes]);

  const availableValues = useCallback((key: string) => {
    if (!product) return [];
    const values = new Set<string>();
    product.variants.forEach((variant) => {
      const matchesOthers = attributeKeys
        .filter((candidate) => candidate !== key)
        .every((candidate) => String(variant.attributes?.[candidate] ?? "") === (selectedAttributes[candidate] ?? ""));
      if (matchesOthers && variant.attributes?.[key] != null) values.add(String(variant.attributes[key]));
    });
    return Array.from(values);
  }, [attributeKeys, product, selectedAttributes]);

  if (state === "loading") {
    return <><Navbar /><main className="mx-auto max-w-5xl px-6 py-16"><LoadingState>Loading product details…</LoadingState></main></>;
  }

  if (state === "not_found" || !product) {
    return <><Navbar /><main className="mx-auto max-w-5xl px-6 py-16"><EmptyState title="This product is unavailable"><Link href="/shop" className="mt-4 inline-block font-semibold text-blue underline">Browse the catalogue</Link></EmptyState></main></>;
  }

  const isService = product.category.toLowerCase().includes("service") || product.tags?.includes("service");
  const image = product.images[0];

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/shop" className="text-sm font-semibold text-blue underline">Back to catalogue</Link>
        <section className="mt-6 grid gap-10 rounded-3xl border border-navy-900/10 bg-white p-7 md:grid-cols-2">
          <div className="grid min-h-64 place-items-center overflow-hidden rounded-2xl bg-paper">
            {image && !imageError ? (
              <Image src={image} alt={product.name} width={640} height={480} className="h-full w-full object-cover" onError={() => setImageError(true)} />
            ) : (
              <p className="px-6 text-center text-sm text-mist">No product image supplied by the catalogue.</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-mist">{isService ? "Service" : "Product"} · {product.category}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{product.name}</h1>
            <p className="mt-1 text-sm text-mist">Brand: {product.brand || "Unavailable"}</p>
            <p className="mt-4 text-mist">{product.description}</p>

            {attributeKeys.length > 0 && (
              <div className="mt-6 space-y-4">
                {attributeKeys.map((key) => (
                  <fieldset key={key}>
                    <legend className="font-semibold capitalize">{key}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableValues(key).map((value) => {
                        const active = selectedAttributes[key] === value;
                        const variantExists = product.variants.some((variant) => String(variant.attributes?.[key] ?? "") === value && isPurchasable(variant));
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!variantExists}
                            onClick={() => setSelectedAttributes((current) => ({ ...current, [key]: value }))}
                            aria-pressed={active}
                            className={"rounded-full border px-3 py-2 text-sm disabled:opacity-40 " + (active ? "border-gold bg-gold/10" : "border-navy-900/20")}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}

            {selectedVariant && (
              <div className="mt-6 space-y-3 rounded-2xl bg-paper p-4 text-sm">
                <p><strong>Condition:</strong> {selectedVariant.condition.replaceAll("_", " ")}</p>
                <p><strong>Availability:</strong> {selectedVariant.availability.replaceAll("_", " ")}</p>
                {selectedVariant.limitations ? <p><strong>Known limitations:</strong> {selectedVariant.limitations}</p> : <p className="text-mist">No limitations were supplied for this variant.</p>}
                {selectedVariant.warranty ? <p><strong>Warranty ({selectedVariant.warranty.version}):</strong> {selectedVariant.warranty.terms}</p> : <p className="text-mist">Warranty terms were not supplied.</p>}
                {selectedVariant.inspection ? <p><strong>Inspection summary:</strong> {selectedVariant.inspection}</p> : <p className="text-mist">No inspection summary was supplied.</p>}
              </div>
            )}

            <p className="mt-6 font-display text-3xl font-semibold">
              {selectedVariant ? "₦" + selectedVariant.price.toLocaleString("en-NG") : "Choose a valid variant"}
            </p>
            {message && <p role="status" className="mt-3 text-sm text-mist">{message}</p>}
            <button
              type="button"
              disabled={!selectedVariant || !isPurchasable(selectedVariant) || isService}
              onClick={() => selectedVariant && void addGadgetToCart({
                product,
                variant: selectedVariant,
                isAuthenticated,
                dispatch,
                getState: () => store,
              }).then(() => setMessage("Added to your cart.")).catch(() => setMessage("We could not add that item. Please try again."))}
              className="mt-6 rounded-full bg-gold px-6 py-3 font-semibold text-navy-900 disabled:opacity-50"
            >
              {isService ? "Request this service separately" : isPurchasable(selectedVariant) ? "Add to cart" : "Unavailable"}
            </button>
            {!attributeKeys.length && product.variants.length > 1 && (
              <fieldset className="mt-6">
                <legend className="font-semibold">Choose a variant</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!isPurchasable(variant)}
                      onClick={() => setSelectedAttributes(Object.fromEntries(Object.entries(variant.attributes ?? {}).map(([key, value]) => [key, String(value)])))}
                      className={"rounded-full border px-3 py-2 text-sm disabled:opacity-40 " + (selectedVariant?.id === variant.id ? "border-gold bg-gold/10" : "border-navy-900/20")}
                    >
                      {variantLabel(variant)}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
