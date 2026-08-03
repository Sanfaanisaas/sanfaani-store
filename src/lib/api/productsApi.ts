import axiosInstance from "./axiosInstance";

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * Shape returned by the backend for a product document.
 * price / stock live on Variant, not on the product itself.
 */
export interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  slug?: string;
  brand?: string;
  status?: string;
  images?: string[];
  variants?: ApiVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiVariant {
  _id: string;
  sku: string;
  price: number;
  inStock?: number;
  condition: string;
  attributes?: Record<string, unknown>;
}

/** Fields accepted by POST /api/products and PATCH /api/products/:id */
export interface ProductPayload {
  name: string;
  description?: string;
  category?: string;
  slug?: string;
  brand?: string;
  status?: "draft" | "active" | "archived";
  images?: string[];
}

// ── API wrappers ──────────────────────────────────────────────────────────────

/** POST /api/products — requires product_admin or super_admin */
export async function createProduct(payload: ProductPayload): Promise<ApiProduct> {
  const res = await axiosInstance.post<{ success: boolean; data: ApiProduct }>(
    "/products",
    payload
  );
  return res.data.data;
}

/** PATCH /api/products/:id — requires product_admin or super_admin */
export async function updateProduct(
  id: string,
  payload: Partial<ProductPayload>
): Promise<ApiProduct> {
  const res = await axiosInstance.patch<{ success: boolean; data: ApiProduct }>(
    `/products/${id}`,
    payload
  );
  return res.data.data;
}

/** DELETE /api/products/:id — soft-deletes (archives) the product */
export async function deleteProduct(id: string): Promise<void> {
  await axiosInstance.delete(`/products/${id}`);
}

/** GET /api/products — public listing, returns products with variants */
export async function fetchProducts(page = 1, limit = 50): Promise<ApiProduct[]> {
  const res = await axiosInstance.get<{
    success: boolean;
    data: { products: ApiProduct[] };
  }>("/products", { params: { page, limit } });
  return res.data.data.products ?? [];
}
