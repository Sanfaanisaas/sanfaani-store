"use client";

import type { ReactNode } from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { ErrorState, LoadingState } from "@/components/ApiState";
import { fetchProducts } from "@/lib/api/productsApi";
import Footer from "@/components/Footer";

import type { PublicProduct } from "@/lib/api/contracts";
import {
  parseCatalogueParams,
  variantMatchesAvailability,
  variantMatchesCondition,
} from "@/lib/catalogue/catalogueParams";

// ================================================================
// CONFIGURATION
// ================================================================

const CATEGORIES = ["All", "smartphones", "laptops", "accessories"];

const CONDITIONS = [
  { label: "All conditions", value: "All" },
  { label: "New", value: "new" },
  { label: "Refurbished — Grade A", value: "refurbished_grade_a" },
  { label: "Refurbished — Grade B", value: "refurbished_grade_b" },
  { label: "Used — Grade A", value: "used_grade_a" },
  { label: "Used — Grade B", value: "used_grade_b" },
];

const BUDGET_RANGES = [
  { label: "Any budget", min: null, max: null },
  { label: "Under # 100,000", min: null, max: 100000 },
  { label: "# 100,000 – # 200,000", min: 100000, max: 200000 },
  { label: "# 200,000 – # 350,000", min: 200000, max: 350000 },
  { label: "# 350,000+", min: 350000, max: null },
];

// ================================================================
// FILTERING
// ================================================================

function filterProducts(
  products: PublicProduct[],
  params: ReturnType<typeof parseCatalogueParams>,
) {
  const q = params.q.toLowerCase();

  return products
    .map((product) => {
      const variants = product.variants.filter(
        (variant) =>
          variantMatchesCondition(variant.condition, params.condition) &&
          variantMatchesAvailability(
            variant.availability,
            params.availability,
          ) &&
          (params.minPrice == null || variant.price >= params.minPrice) &&
          (params.maxPrice == null || variant.price <= params.maxPrice),
      );

      if (!variants.length) return null;

      const matchesQuery =
        !q ||
        [
          product.name,
          product.description,
          product.brand,
          product.category,
        ].some((value) => value.toLowerCase().includes(q));

      const matchesCategory =
        params.category === "All" || product.category === params.category;

      const matchesBrand =
        params.brand === "All" || product.brand === params.brand;

      if (!matchesQuery || !matchesCategory || !matchesBrand) {
        return null;
      }

      return {
        ...product,
        variants,
      };
    })
    .filter((product): product is PublicProduct => product !== null);
}

function sortProducts(
  products: PublicProduct[],
  sort: ReturnType<typeof parseCatalogueParams>["sort"],
) {
  const copy = [...products];

  copy.sort((left, right) => {
    const leftPrice = Math.min(
      ...left.variants.map((variant) => variant.price),
    );

    const rightPrice = Math.min(
      ...right.variants.map((variant) => variant.price),
    );

    if (sort === "price_asc") {
      return leftPrice - rightPrice;
    }

    if (sort === "price_desc") {
      return rightPrice - leftPrice;
    }

    if (sort === "name_asc") {
      return left.name.localeCompare(right.name);
    }

    return 0;
  });

  return copy;
}

// ================================================================
// SHOP
// ================================================================

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [pending, startTransition] = useTransition();

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const params = useMemo(
    () => parseCatalogueParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  // ==============================================================
  // LOAD PRODUCTS
  // ==============================================================

  const load = useCallback(async () => {
    try {
      setState("loading");

      const response = await fetchProducts(params.page, params.pageSize);

      const filtered = sortProducts(
        filterProducts(response.products, params),
        params.sort,
      );

      setProducts(filtered);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [params]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  // ==============================================================
  // SEARCH
  // ==============================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== params.q) {
        updateFilter({
          q: searchInput || null,
          page: 1,
        });
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // ==============================================================
  // URL FILTER HELPERS
  // ==============================================================

  function updateFilter(updates: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    startTransition(() => {
      router.push(pathname + (next.size ? `?${next.toString()}` : ""));
    });
  }

  function clearFilters() {
    setSearchInput("");
    router.push(pathname);
  }

  // ==============================================================
  // BUDGET LABEL
  // ==============================================================

  const activeBudgetLabel = useMemo(() => {
    const match = BUDGET_RANGES.find(
      (budget) =>
        budget.min === params.minPrice && budget.max === params.maxPrice,
    );

    return match ? match.label : "Any budget";
  }, [params.minPrice, params.maxPrice]);

  // ==============================================================
  // ACTIVE FILTER COUNT
  // ==============================================================

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (params.category !== "All") count++;
    if (params.condition !== "All") count++;
    if (params.brand !== "All") count++;
    if (params.minPrice != null || params.maxPrice != null) {
      count++;
    }
    if (params.q) count++;

    return count;
  }, [
    params.category,
    params.condition,
    params.brand,
    params.minPrice,
    params.maxPrice,
    params.q,
  ]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f5] text-slate-900">
        {/* ======================================================
            HEADER / INTRO
        ======================================================= */}

        <section className="bg-[#091729] text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="border-b border-white/10 py-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-medium text-white/45 transition-colors hover:text-white"
              >
                <ArrowLeft size={14} />
                Back home
              </Link>
            </div>

            <div className="grid gap-10 py-14 md:grid-cols-[1fr_auto] md:items-end lg:py-20">
              <div className="max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#d9b85d]">
                  Sanfaani Store
                </p>

                <h1 className="mt-5 font-display text-5xl font-bold leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
                  Find the right
                  <span className="block text-[#d9b85d]">device for you.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                  Browse phones, laptops and accessories with clear pricing,
                  condition details and straightforward information.
                </p>
              </div>

              <Link
                href="/guidance"
                className="group inline-flex h-11 w-fit items-center gap-3 border-b border-white/20 pb-3 text-xs font-semibold text-white transition-colors hover:border-[#d9b85d] hover:text-[#d9b85d]"
              >
                Need help choosing?
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================
            CATALOGUE
        ======================================================= */}

        <section className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:pt-12">
          {/* ====================================================
              SEARCH + CATEGORY BAR
          ==================================================== */}

          <div className="border-y border-slate-200 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}

              <div className="flex h-11 w-full max-w-xl items-center border-b border-slate-300 focus-within:border-[#091729]">
                <Search size={17} className="mr-3 shrink-0 text-slate-400" />

                <input
                  type="search"
                  placeholder="Search phones, laptops, accessories..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Categories */}

              <div className="flex items-center gap-5 overflow-x-auto pb-1 lg:pb-0">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      updateFilter({
                        category,
                        page: 1,
                      })
                    }
                    className={`relative shrink-0 pb-2 text-xs font-semibold capitalize transition-colors ${
                      params.category === category
                        ? "text-[#091729]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {category}

                    <span
                      className={`absolute bottom-0 left-0 h-px bg-[#091729] transition-all duration-300 ${
                        params.category === category ? "w-full" : "w-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ====================================================
              RESULTS TOOLBAR
          ==================================================== */}

          <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#091729]">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Showing available items in the catalogue
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex h-10 items-center gap-2 border border-slate-200 bg-white px-4 text-xs font-semibold text-[#091729] transition-colors hover:border-slate-300 md:hidden"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-[#d09d27]">{activeFilterCount}</span>
                )}
              </button>

              {/* Sort */}

              <div className="relative flex items-center">
                <span className="mr-2 hidden text-[11px] text-slate-400 sm:block">
                  Sort
                </span>

                <select
                  value={params.sort}
                  onChange={(event) =>
                    updateFilter({
                      sort: event.target.value,
                      page: 1,
                    })
                  }
                  className="h-10 appearance-none border border-slate-200 bg-white pl-3 pr-9 text-xs font-semibold text-[#091729] outline-none focus:border-slate-400"
                >
                  <option value="newest">Newest arrivals</option>

                  <option value="price_asc">Price: low to high</option>

                  <option value="price_desc">Price: high to low</option>

                  <option value="name_asc">Name: A to Z</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              CONTENT
          ==================================================== */}

          <div className="grid gap-12 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* ==================================================
                DESKTOP FILTERS
            =================================================== */}

            <aside className="hidden md:block">
              <div className="sticky top-28">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#091729]">
                    Refine
                  </span>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[11px] font-semibold text-slate-400 transition-colors hover:text-[#091729]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search */}

                <div className="border-b border-slate-200 py-6">
                  <label className="mb-3 block text-xs font-semibold text-[#091729]">
                    Search
                  </label>

                  <div className="flex h-10 items-center border border-slate-200 bg-white px-3 focus-within:border-slate-400">
                    <Search size={15} className="mr-2 text-slate-400" />

                    <input
                      type="search"
                      placeholder="Search..."
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Category */}

                <FilterSection title="Category">
                  <div className="space-y-1">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          updateFilter({
                            category,
                            page: 1,
                          })
                        }
                        className={`flex w-full items-center justify-between py-2 text-left text-xs capitalize transition-colors ${
                          params.category === category
                            ? "font-semibold text-[#091729]"
                            : "text-slate-500 hover:text-[#091729]"
                        }`}
                      >
                        <span>{category}</span>

                        {params.category === category && (
                          <span className="h-1.5 w-1.5 bg-[#d9b85d]" />
                        )}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Condition */}

                <FilterSection title="Condition">
                  <SelectFilter
                    value={params.condition}
                    onChange={(value) =>
                      updateFilter({
                        condition: value,
                        page: 1,
                      })
                    }
                    options={CONDITIONS}
                  />
                </FilterSection>

                {/* Budget */}

                <FilterSection title="Budget">
                  <SelectFilter
                    value={activeBudgetLabel}
                    onChange={(value) => {
                      const selected = BUDGET_RANGES.find(
                        (budget) => budget.label === value,
                      );

                      if (selected) {
                        updateFilter({
                          minPrice: selected.min,
                          maxPrice: selected.max,
                          page: 1,
                        });
                      }
                    }}
                    options={BUDGET_RANGES.map((budget) => ({
                      label: budget.label,
                      value: budget.label,
                    }))}
                  />
                </FilterSection>

                {/* Guidance */}

                <div className="pt-7">
                  <p className="text-xs font-semibold text-[#091729]">
                    Not sure what to buy?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Tell us what you need and we'll help narrow down your
                    options.
                  </p>

                  <Link
                    href="/guidance"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#091729] hover:text-[#b58e30]"
                  >
                    Find your device
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </aside>

            {/* ==================================================
                PRODUCTS
            =================================================== */}

            <div
              className={`min-w-0 transition-opacity duration-300 ${
                pending ? "pointer-events-none opacity-50" : "opacity-100"
              }`}
            >
              {state === "loading" ? (
                <LoadingState>Loading catalogue…</LoadingState>
              ) : state === "error" ? (
                <ErrorState
                  message="The catalogue is currently unavailable."
                  onRetry={() => void load()}
                />
              ) : products.length === 0 ? (
                <div className="min-h-[460px] border-y border-slate-200 bg-white px-6 py-20 text-center">
                  <Search size={22} className="mx-auto text-slate-300" />

                  <h2 className="mt-5 font-display text-2xl font-bold text-[#091729]">
                    Nothing matched your search.
                  </h2>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                    Try another search or remove one of the filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex h-10 items-center px-5 text-xs font-semibold text-white bg-[#091729] transition-colors hover:bg-[#132a45]"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <div key={product.id} className="group">
                        <ProductCard gadget={product} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}

                  <nav
                    className="mt-16 flex items-center justify-between border-t border-slate-200 pt-6"
                    aria-label="Catalogue pages"
                  >
                    <button
                      type="button"
                      disabled={params.page === 1}
                      onClick={() =>
                        updateFilter({
                          page: params.page - 1,
                        })
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#091729] transition-colors hover:text-[#b58e30] disabled:pointer-events-none disabled:text-slate-300"
                    >
                      <ArrowLeft size={14} />
                      Previous
                    </button>

                    <span className="text-xs text-slate-400">
                      Page {params.page}
                    </span>

                    <button
                      type="button"
                      disabled={products.length < params.pageSize}
                      onClick={() =>
                        updateFilter({
                          page: params.page + 1,
                        })
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#091729] transition-colors hover:text-[#b58e30] disabled:pointer-events-none disabled:text-slate-300"
                    >
                      Next
                      <ArrowRight size={14} />
                    </button>
                  </nav>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================
            MOBILE FILTER DRAWER
        ======================================================= */}

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}

            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-[#091729]/45"
            />

            {/* Drawer */}

            <aside className="absolute right-0 top-0 flex h-full w-[min(390px,92vw)] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Catalogue
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#091729]">
                    Refine results
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 text-[#091729] hover:bg-slate-50"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                {/* Search */}

                <div className="border-b border-slate-200 py-6">
                  <label className="mb-3 block text-xs font-semibold text-[#091729]">
                    Search
                  </label>

                  <div className="flex h-11 items-center border border-slate-200 px-3">
                    <Search size={16} className="mr-2 text-slate-400" />

                    <input
                      type="search"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Category */}

                <FilterSection title="Category">
                  <div className="space-y-1">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          updateFilter({
                            category,
                            page: 1,
                          })
                        }
                        className={`flex w-full items-center justify-between py-2.5 text-left text-sm capitalize ${
                          params.category === category
                            ? "font-semibold text-[#091729]"
                            : "text-slate-500"
                        }`}
                      >
                        <span>{category}</span>

                        {params.category === category && (
                          <span className="h-1.5 w-1.5 bg-[#d9b85d]" />
                        )}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Condition */}

                <FilterSection title="Condition">
                  <SelectFilter
                    value={params.condition}
                    onChange={(value) =>
                      updateFilter({
                        condition: value,
                        page: 1,
                      })
                    }
                    options={CONDITIONS}
                    mobile
                  />
                </FilterSection>

                {/* Budget */}

                <FilterSection title="Budget">
                  <SelectFilter
                    value={activeBudgetLabel}
                    onChange={(value) => {
                      const selected = BUDGET_RANGES.find(
                        (budget) => budget.label === value,
                      );

                      if (selected) {
                        updateFilter({
                          minPrice: selected.min,
                          maxPrice: selected.max,
                          page: 1,
                        });
                      }
                    }}
                    options={BUDGET_RANGES.map((budget) => ({
                      label: budget.label,
                      value: budget.label,
                    }))}
                    mobile
                  />
                </FilterSection>
              </div>

              <div className="border-t border-slate-200 p-5">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 border border-slate-200 py-3 text-xs font-semibold text-[#091729] hover:bg-slate-50"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1 bg-[#091729] py-3 text-xs font-semibold text-white hover:bg-[#132a45]"
                  >
                    Show {products.length}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

// ================================================================
// SMALL UI COMPONENTS
// ================================================================

type SelectOption = {
  label: string;
  value: string;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 py-6">
      <p className="mb-3 text-xs font-semibold text-[#091729]">{title}</p>

      {children}
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  mobile = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  mobile?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none border border-slate-200 bg-white text-slate-600 outline-none transition-colors focus:border-slate-400 ${
          mobile ? "h-11 px-3 pr-9 text-sm" : "h-10 px-3 pr-9 text-xs"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

// ================================================================
// PAGE
// ================================================================

export default function Shop() {
  return (
    <Suspense fallback={<LoadingState>Loading catalogue…</LoadingState>}>
      <ShopContent />
    </Suspense>
  );
}
