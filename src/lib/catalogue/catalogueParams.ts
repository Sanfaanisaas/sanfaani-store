import type { ProductCondition, AvailabilityStatus } from "@/lib/api/contracts";

export type CatalogueSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface CatalogueSearchParams {
  q: string;
  category: string;
  brand: string;
  condition: string;
  availability: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: CatalogueSort;
  page: number;
  pageSize: number;
}

const conditions = new Set(["All", "new", "refurbished_grade_a", "refurbished_grade_b", "used_grade_a", "used_grade_b"]);
const availabilityValues = new Set(["All", "in_stock", "low_stock", "out_of_stock", "sourcing"]);
const sorts = new Set<CatalogueSort>(["newest", "price_asc", "price_desc", "name_asc"]);

function readPositiveInt(value: string | null, fallback: number, max = 100): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function readPrice(value: string | null): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseCatalogueParams(searchParams: URLSearchParams): CatalogueSearchParams {
  const sortCandidate = searchParams.get("sort") ?? "newest";
  const condition = searchParams.get("condition") ?? searchParams.get("condition") ?? "All";
  const availability = searchParams.get("availability") ?? "All";
  return {
    q: searchParams.get("q")?.trim() || searchParams.get("search")?.trim() || "",
    category: searchParams.get("category") ?? "All",
    brand: searchParams.get("brand") ?? "All",
    condition: conditions.has(condition) ? condition : "All",
    availability: availabilityValues.has(availability) ? availability : "All",
    minPrice: readPrice(searchParams.get("minPrice") ?? searchParams.get("minimumPrice")),
    maxPrice: readPrice(searchParams.get("maxPrice") ?? searchParams.get("maximumPrice")),
    sort: sorts.has(sortCandidate as CatalogueSort) ? (sortCandidate as CatalogueSort) : "newest",
    page: readPositiveInt(searchParams.get("page"), 1),
    pageSize: readPositiveInt(searchParams.get("pageSize") ?? searchParams.get("limit"), 12, 48),
  };
}

export function catalogueParamsToQuery(params: CatalogueSearchParams): Record<string, string | number | null> {
  return {
    q: params.q || null,
    search: null,
    category: params.category === "All" ? null : params.category,
    brand: params.brand === "All" ? null : params.brand,
    condition: params.condition === "All" ? null : params.condition,
    availability: params.availability === "All" ? null : params.availability,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort === "newest" ? null : params.sort,
    page: params.page === 1 ? null : params.page,
    pageSize: params.pageSize === 12 ? null : params.pageSize,
  };
}

export function variantMatchesAvailability(availability: AvailabilityStatus, filter: string) {
  return filter === "All" || availability === filter;
}

export function variantMatchesCondition(condition: ProductCondition, filter: string) {
  return filter === "All" || condition === filter;
}
