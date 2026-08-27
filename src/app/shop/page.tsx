"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

export default function Shop() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [gadgets, setGadgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // 1. Read state directly from URL Search Params
  const activeType = searchParams.get("type") || "product"; // product | bundle | repair_service
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const condition = searchParams.get("condition") || "All";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 6;

  // Local form state for smooth typing
  const [formSearch, setFormSearch] = useState(search);
  const [formCategory, setFormCategory] = useState(category);
  const [formCondition, setFormCondition] = useState(condition);

  // Keep form state in sync when URL changes
  useEffect(() => {
    setFormSearch(search);
    setFormCategory(category);
    setFormCondition(condition);
  }, [search, category, condition]);

  // 2. Fetch directly from Express backend endpoint (/products)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (activeType) query.set("type", activeType);
        if (search) query.set("search", search);
        if (category !== "All") query.set("category", category);
        if (condition !== "All") query.set("condition", condition);
        if (sort) query.set("sort", sort);
        query.set("page", page.toString());
        query.set("limit", pageSize.toString());

        const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
        const response = await fetch(
          `${backendUrl}/products?${query.toString()}`,
        );
        const result = await response.json();

        if (result.success || response.ok) {
          const fetchedProducts =
            result.data?.products ?? result.products ?? [];
          setGadgets(fetchedProducts);
          setTotalItems(
            result.data?.total ?? result.total ?? fetchedProducts.length,
          );
        }
      } catch (error) {
        console.error("Failed to fetch products from Express API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeType, search, category, condition, sort, page]);

  // Helper to safely write parameters to the browser address bar
  const updateQueryParams = (
    newParams: Record<string, string | number | null>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleFilterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateQueryParams({
      search: formSearch,
      category: formCategory,
      condition: formCondition,
      page: 1, // Reset page index on search/filter update
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Information Architecture Tabs (Products / Bundles / Repair Services) */}
        <div className="mb-8 border-b border-navy-900/10 pb-4">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Explore our premium gadgets.
          </h1>
          <p className="mt-1 text-sm text-mist">
            Transparent specs, verified condition reports, and real stock
            availability.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { id: "product", label: "Products" },
              { id: "bundle", label: "Bundles" },
              { id: "repair_service", label: "Repair Services" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateQueryParams({ type: tab.id, page: 1 })}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeType === tab.id
                    ? "bg-navy-900 text-white"
                    : "bg-navy-900/5 text-ink hover:bg-navy-900/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Filter Sidebar */}
          <form
            onSubmit={handleFilterSubmit}
            className="h-fit rounded-2xl border border-navy-900/10 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 font-semibold text-ink pb-2 border-b border-navy-900/10">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="search"
                className="text-sm font-semibold text-ink"
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                placeholder="Search catalogue..."
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-semibold text-ink"
              >
                Category
              </label>
              <select
                id="category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              >
                <option value="All">All Categories</option>
                <option value="smartphones">Smartphones</option>
                <option value="laptops">Laptops</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="condition"
                className="text-sm font-semibold text-ink"
              >
                Condition Grade
              </label>
              <select
                id="condition"
                value={formCondition}
                onChange={(e) => setFormCondition(e.target.value)}
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              >
                <option value="All">All Grades</option>
                <option value="new">Brand New</option>
                <option value="refurbished_grade_a">
                  Refurbished - Grade A
                </option>
                <option value="refurbished_grade_b">
                  Refurbished - Grade B
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-gold/90"
            >
              Apply Filters
            </button>
          </form>

          {/* Product List & Pagination */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-mist">
                {totalItems} result(s) found
              </span>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort"
                  className="text-xs font-semibold text-mist uppercase"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => updateQueryParams({ sort: e.target.value })}
                  className="rounded-xl border border-navy-900/10 px-3 py-1.5 text-xs text-ink outline-none focus:border-gold"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading || isPending ? (
              <div className="flex flex-col items-center justify-center py-20 text-mist">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Connecting to Sanfaani Store API...</p>
              </div>
            ) : gadgets.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {gadgets.map((gadget) => (
                    <ProductCard
                      key={gadget._id ?? gadget.id ?? gadget.slug}
                      gadget={gadget}
                    />
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQueryParams({ page: Math.max(1, page - 1) })
                    }
                    disabled={page === 1}
                    className="rounded-full border border-navy-900/10 p-2 text-ink disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 text-sm font-medium text-ink">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQueryParams({
                        page: Math.min(totalPages, page + 1),
                      })
                    }
                    disabled={page >= totalPages}
                    className="rounded-full border border-navy-900/10 p-2 text-ink disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-navy-900/10 bg-white px-4 py-12 text-center text-sm text-mist">
                No products match these filters yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
