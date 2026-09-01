"use client";

import { Suspense, FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { fetchProducts } from "@/lib/api/productsApi";
import type { PublicProduct } from "@/lib/api/contracts";
import {
  catalogueParamsToQuery,
  parseCatalogueParams,
  variantMatchesAvailability,
  variantMatchesCondition,
} from "@/lib/catalogue/catalogueParams";

function filterProducts(products: PublicProduct[], params: ReturnType<typeof parseCatalogueParams>) {
  const q = params.q.toLowerCase();
  return products
    .map((product) => {
      const variants = product.variants.filter((variant) =>
        variantMatchesCondition(variant.condition, params.condition) &&
        variantMatchesAvailability(variant.availability, params.availability) &&
        (params.minPrice == null || variant.price >= params.minPrice) &&
        (params.maxPrice == null || variant.price <= params.maxPrice),
      );
      if (!variants.length) return null;
      const matchesQuery = !q || [product.name, product.description, product.brand, product.category]
        .some((value) => value.toLowerCase().includes(q));
      const matchesCategory = params.category === "All" || product.category === params.category;
      const matchesBrand = params.brand === "All" || product.brand === params.brand;
      if (!matchesQuery || !matchesCategory || !matchesBrand) return null;
      return { ...product, variants };
    })
    .filter((product): product is PublicProduct => product !== null);
}

function sortProducts(products: PublicProduct[], sort: ReturnType<typeof parseCatalogueParams>["sort"]) {
  const copy = [...products];
  copy.sort((left, right) => {
    const leftPrice = Math.min(...left.variants.map((variant) => variant.price));
    const rightPrice = Math.min(...right.variants.map((variant) => variant.price));
    if (sort === "price_asc") return leftPrice - rightPrice;
    if (sort === "price_desc") return rightPrice - leftPrice;
    if (sort === "name_asc") return left.name.localeCompare(right.name);
    return 0;
  });
  return copy;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const params = useMemo(() => parseCatalogueParams(searchParams), [searchParams]);

  const load = useCallback(async () => {
    try {
      const response = await fetchProducts(params.page, params.pageSize);
      const filtered = sortProducts(filterProducts(response.products, params), params.sort);
      setProducts(filtered);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [params]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function update(values: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All") next.delete(key);
      else next.set(key, String(value));
    });
    startTransition(() => router.push(pathname + (next.size ? "?" + next.toString() : "")));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update({
      ...catalogueParamsToQuery({
        ...params,
        q: String(data.get("q") ?? ""),
        category: String(data.get("category") ?? "All"),
        brand: String(data.get("brand") ?? "All"),
        condition: String(data.get("condition") ?? "All"),
        availability: String(data.get("availability") ?? "All"),
        minPrice: data.get("minPrice") ? Number(data.get("minPrice")) : null,
        maxPrice: data.get("maxPrice") ? Number(data.get("maxPrice")) : null,
        sort: String(data.get("sort") ?? "newest") as typeof params.sort,
        page: 1,
      }),
    });
  }

  const brands = useMemo(() => {
    const values = new Set(products.map((product) => product.brand).filter(Boolean));
    return ["All", ...Array.from(values).sort()];
  }, [products]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
        <header>
          <h1 className="font-display text-3xl font-semibold text-ink">Shop devices and repair services</h1>
          <p className="mt-2 text-sm text-mist">Availability and condition are confirmed by the catalogue API. Filters are preserved in the URL.</p>
        </header>
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <form key={searchParams.toString()} onSubmit={submit} className="h-fit space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5">
            <label className="block text-sm font-semibold">Search
              <input name="q" defaultValue={params.q} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2" />
            </label>
            <label className="block text-sm font-semibold">Category
              <select name="category" defaultValue={params.category} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2">
                <option>All</option>
                <option>smartphones</option>
                <option>laptops</option>
                <option>accessories</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">Brand
              <select name="brand" defaultValue={params.brand} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2">
                {brands.map((brand) => <option key={brand}>{brand}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Condition
              <select name="condition" defaultValue={params.condition} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2">
                <option>All</option>
                <option value="new">New</option>
                <option value="refurbished_grade_a">Refurbished — Grade A</option>
                <option value="refurbished_grade_b">Refurbished — Grade B</option>
                <option value="used_grade_a">Used — Grade A</option>
                <option value="used_grade_b">Used — Grade B</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">Availability
              <select name="availability" defaultValue={params.availability} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2">
                <option>All</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="sourcing">Sourcing</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">Min price
                <input name="minPrice" type="number" min="0" defaultValue={params.minPrice ?? ""} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2" />
              </label>
              <label className="block text-sm font-semibold">Max price
                <input name="maxPrice" type="number" min="0" defaultValue={params.maxPrice ?? ""} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2" />
              </label>
            </div>
            <label className="block text-sm font-semibold">Sort
              <select name="sort" defaultValue={params.sort} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name_asc">Name</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-full bg-gold px-4 py-2 font-semibold text-navy-900">Apply filters</button>
            <button type="button" onClick={() => update({ q: null, category: null, brand: null, condition: null, availability: null, minPrice: null, maxPrice: null, sort: null, page: null, pageSize: null })} className="w-full rounded-full border border-navy-900/20 px-4 py-2 text-sm">Reset filters</button>
          </form>
          <section aria-live="polite">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-mist">{products.length} result{products.length === 1 ? "" : "s"} on this page</p>
            </div>
            {state === "loading" || pending ? (
              <LoadingState>Loading catalogue…</LoadingState>
            ) : state === "error" ? (
              <ErrorState message="The catalogue is currently unavailable." onRetry={() => void load()} />
            ) : products.length === 0 ? (
              <EmptyState title="No products match these filters">Try adjusting your search or filters.</EmptyState>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => <ProductCard key={product.id} gadget={product} />)}
                </div>
                <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Catalogue pages">
                  <button type="button" disabled={params.page === 1} onClick={() => update({ page: params.page - 1 })} className="rounded-full border border-navy-900/20 px-4 py-2 disabled:opacity-50">Previous</button>
                  <span className="text-sm">Page {params.page}</span>
                  <button type="button" disabled={products.length < params.pageSize} onClick={() => update({ page: params.page + 1 })} className="rounded-full border border-navy-900/20 px-4 py-2 disabled:opacity-50">Next</button>
                </nav>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default function Shop() {
  return <Suspense fallback={<LoadingState>Loading catalogue…</LoadingState>}><ShopContent /></Suspense>;
}
