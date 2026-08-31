"use client";

import {
  Suspense,
  FormEvent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { fetchProducts } from "@/lib/api/productsApi";
import { PRODUCT_CONDITION, type PublicProduct } from "@/lib/api/contracts";

const allowedConditions = new Set<string>(["All", ...PRODUCT_CONDITION]);

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search")?.trim() ?? "";
  const category = searchParams.get("category") ?? "All";
  const rawCondition = searchParams.get("condition") ?? "All";
  const condition = allowedConditions.has(rawCondition) ? rawCondition : "All";
  const sort = searchParams.get("sort") ?? "newest";
  const type = searchParams.get("type") ?? "all";

  const load = useCallback(async () => {
    try {
      const response = await fetchProducts({
        page,
        limit: 12,
        search,
        category,
        condition,
        sort,
        type,
      });

      setProducts(response.products);
      setTotal(response.pagination.total);
      setPages(Math.max(1, response.pagination.pages));
      setState("ready");
    } catch {
      setState("error");
    }
  }, [page, search, category, condition, sort, type]);

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

  function update(values: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        value === "All" ||
        value === "all"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    startTransition(() => {
      router.push(pathname + (params.size ? `?${params.toString()}` : ""));
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update({
      search: String(data.get("search") ?? ""),
      category: String(data.get("category") ?? "All"),
      condition: String(data.get("condition") ?? "All"),
      sort: String(data.get("sort") ?? "newest"),
      page: 1,
    });
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
        <header>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Shop devices and repair services
          </h1>
          <p className="mt-2 text-sm text-mist">
            Availability and condition are confirmed by the catalogue API.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-navy-900/10 pb-4">
            {[
              { id: "all", label: "All Items" },
              { id: "product", label: "Devices & Hardware" },
              { id: "bundle", label: "Curated Bundles" },
              { id: "service", label: "Repair Services" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => update({ type: tab.id, page: 1 })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  type === tab.id
                    ? "bg-navy-900 text-white"
                    : "bg-navy-900/5 text-navy-900 hover:bg-navy-900/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <form
            key={searchParams.toString()}
            onSubmit={submit}
            className="h-fit space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5"
          >
            <label className="block text-sm font-semibold">
              Search
              <input
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2"
              />
            </label>

            <label className="block text-sm font-semibold">
              Category
              <select
                name="category"
                defaultValue={category}
                className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2"
              >
                <option value="All">All</option>
                <option value="smartphones">Smartphones</option>
                <option value="laptops">Laptops</option>
                <option value="accessories">Accessories</option>
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Condition
              <select
                name="condition"
                defaultValue={condition}
                className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2"
              >
                <option value="All">All</option>
                <option value="new">New</option>
                <option value="refurbished_grade_a">
                  Refurbished — Grade A
                </option>
                <option value="refurbished_grade_b">
                  Refurbished — Grade B
                </option>
                <option value="used_grade_a">Used — Grade A</option>
                <option value="used_grade_b">Used — Grade B</option>
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Sort By
              <select
                name="sort"
                defaultValue={sort}
                className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-gold px-4 py-2 font-semibold text-navy-900 hover:brightness-95 transition"
            >
              Apply filters
            </button>
          </form>

          <section aria-live="polite">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-mist">
                {total} result{total === 1 ? "" : "s"}
              </p>
            </div>

            {state === "loading" || pending ? (
              <LoadingState>Loading catalogue…</LoadingState>
            ) : state === "error" ? (
              <ErrorState
                message="The catalogue is currently unavailable."
                onRetry={() => void load()}
              />
            ) : products.length === 0 ? (
              <EmptyState title="No products match these filters">
                Try adjusting your search or filters.
              </EmptyState>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => (
                    <ProductCard key={product.id} gadget={product} />
                  ))}
                </div>

                <nav
                  className="mt-8 flex items-center justify-center gap-3"
                  aria-label="Catalogue pages"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => update({ page: page - 1 })}
                    className="rounded-full border border-navy-900/20 px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm">
                    Page {page} of {pages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => update({ page: page + 1 })}
                    className="rounded-full border border-navy-900/20 px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
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
  return (
    <Suspense fallback={<LoadingState>Loading catalogue…</LoadingState>}>
      <ShopContent />
    </Suspense>
  );
}
