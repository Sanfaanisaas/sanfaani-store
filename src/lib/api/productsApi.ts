import { apiClient } from "./client";
import {
  AVAILABILITY_STATUS,
  PRODUCT_CONDITION,
  type AvailabilityStatus,
  type ProductCondition,
  type ProductListResponse,
  type PublicProduct,
  type PublicVariant,
} from "./contracts";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected API response");
  return value as Record<string, unknown>;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function warranty(
  value: unknown,
): { version: string; terms: string } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const item = value as Record<string, unknown>;
  return typeof item.version === "string" && typeof item.terms === "string"
    ? { version: item.version, terms: item.terms }
    : undefined;
}

function normalizeVariant(value: unknown): PublicVariant {
  const item = record(value);
  const availability = text(item.availability, "out_of_stock");
  const condition = text(item.condition, "used_grade_b");

  return {
    id: text(item.id ?? item._id),
    sku: text(item.sku),
    attributes: record(item.attributes ?? {}),
    price: number(item.price),
    availability: (AVAILABILITY_STATUS as readonly string[]).includes(
      availability,
    )
      ? (availability as AvailabilityStatus)
      : "out_of_stock",
    condition: (PRODUCT_CONDITION as readonly string[]).includes(condition)
      ? (condition as ProductCondition)
      : "used_grade_b",
    limitations: text(item.limitations) || undefined,
    warranty: warranty(item.warranty),
  };
}

export function normalizeProduct(value: unknown): PublicProduct {
  const item = record(value);
  const id = text(item.id ?? item._id);
  const slug = text(item.slug);

  if (!id || !slug) {
    throw new Error("Product response is missing an identifier");
  }

  return {
    id,
    slug,
    name: text(item.name),
    description: text(item.description),
    category: text(item.category, "Uncategorised"),
    brand: text(item.brand, "Sanfaani"),
    images: array(item.images).filter(
      (image): image is string => typeof image === "string",
    ),
    tags: array(item.tags).filter(
      (tag): tag is string => typeof tag === "string",
    ),
    isFeatured: item.isFeatured === true,
    variants: array(item.variants).map(normalizeVariant),
  };
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  condition?: string;
  sort?: string;
  type?: string;
}

export async function fetchProducts(
  paramsOrPage: FetchProductsParams | number = 1,
  defaultLimit = 12,
): Promise<ProductListResponse> {
  const query = new URLSearchParams();

  let currentPage = 1;
  let currentLimit = defaultLimit;

  if (typeof paramsOrPage === "number") {
    currentPage = paramsOrPage;
    currentLimit = defaultLimit;
    query.set("page", String(currentPage));
    query.set("limit", String(currentLimit));
  } else {
    currentPage = paramsOrPage.page ?? 1;
    currentLimit = paramsOrPage.limit ?? defaultLimit;

    query.set("page", String(currentPage));
    query.set("limit", String(currentLimit));

    if (paramsOrPage.search?.trim()) {
      query.set("search", paramsOrPage.search.trim());
    }
    if (paramsOrPage.category && paramsOrPage.category !== "All") {
      query.set("category", paramsOrPage.category);
    }
    if (paramsOrPage.condition && paramsOrPage.condition !== "All") {
      query.set("condition", paramsOrPage.condition);
    }
    if (paramsOrPage.sort) {
      query.set("sort", paramsOrPage.sort);
    }
    if (paramsOrPage.type && paramsOrPage.type !== "all") {
      query.set("type", paramsOrPage.type);
    }
  }

  const data = await apiClient.get<{
    products?: unknown[];
    pagination?: unknown;
  }>(`/products?${query.toString()}`);

  const pagination = record(data.pagination ?? {});
  const products = array(data.products).map(normalizeProduct);

  return {
    products,
    pagination: {
      total: number(pagination.total, products.length),
      page: number(pagination.page, currentPage),
      limit: number(pagination.limit, currentLimit),
      pages: number(pagination.pages, 1),
    },
  };
}

export async function fetchProduct(slug: string): Promise<PublicProduct> {
  return normalizeProduct(
    await apiClient.get<unknown>(`/products/${encodeURIComponent(slug)}`),
  );
}
