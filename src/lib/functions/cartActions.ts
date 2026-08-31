import { apiClient } from "@/lib/api/client";
import type { PublicProduct, PublicVariant } from "@/lib/api/contracts";
import {
  addToCart,
  removeFromCart,
  setCart,
  syncCartFromStorage,
  updateQuantity,
  type CartItem,
} from "@/lib/redux/slices/cartSlice";
import type { Action, Dispatch } from "@reduxjs/toolkit";

export type CartStorageMode = "server" | "guest";

interface ApiCartItem {
  id?: string;
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  maxStock?: number;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "sourcing";
}

interface ApiCartResponse {
  items: ApiCartItem[];
  subtotal?: number;
  total?: number;
}

export function buildCartItem(
  product: PublicProduct,
  variant: PublicVariant,
): CartItem {
  return {
    productId: product.id,
    variantId: variant.id,
    sku: variant.sku || variant.id,
    name: product.name,
    image: product.images?.[0],
    price: variant.price,
    quantity: 1,
    availability: variant.availability,
  };
}

export function safeGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("guestCart");
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is CartItem =>
            Boolean(item) &&
            typeof item === "object" &&
            ("sku" in item || "variantId" in item) &&
            "quantity" in item,
        )
      : [];
  } catch {
    window.localStorage.removeItem("guestCart");
    return [];
  }
}

export function saveGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("guestCart", JSON.stringify(items));
  } catch {
    // Storage quota or unavailable
  }
}

function normalizeServerCartItems(
  data: ApiCartResponse | ApiCartItem[] | unknown,
): CartItem[] {
  let list: ApiCartItem[] = [];
  if (Array.isArray(data)) {
    list = data as ApiCartItem[];
  } else if (data && typeof data === "object" && "items" in data) {
    list = Array.isArray((data as ApiCartResponse).items)
      ? (data as ApiCartResponse).items
      : [];
  }

  return list.map((item) => ({
    productId: String(item.productId),
    variantId: String(item.variantId),
    sku: String(item.sku || item.variantId),
    name: String(item.name),
    image: item.image ? String(item.image) : undefined,
    price: Number(item.price) || 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
    maxStock: typeof item.maxStock === "number" ? item.maxStock : undefined,
    availability: item.availability || "in_stock",
  }));
}

/**
 * Hydrates Redux with guest items or fetches server cart.
 */
export async function initializeCart(
  isAuthenticated: boolean,
  dispatch: Dispatch<Action>,
): Promise<void> {
  if (isAuthenticated) {
    try {
      const data = await apiClient.get<unknown>("/cart");
      const items = normalizeServerCartItems(data);
      dispatch(setCart(items));
    } catch {
      const guest = safeGuestCart();
      if (guest.length > 0) dispatch(syncCartFromStorage(guest));
    }
  } else {
    const guest = safeGuestCart();
    if (guest.length > 0) {
      dispatch(syncCartFromStorage(guest));
    }
  }
}

/**
 * Merges local guest cart with server cart upon authentication.
 */
export async function mergeGuestCartOnLogin(
  dispatch: Dispatch<Action>,
): Promise<void> {
  const localItems = safeGuestCart();
  if (localItems.length > 0) {
    try {
      const payload = localItems.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));
      const data = await apiClient.post<unknown>("/cart/merge", {
        body: { items: payload },
      });
      const mergedItems = normalizeServerCartItems(data);
      dispatch(setCart(mergedItems));
      window.localStorage.removeItem("guestCart");
      return;
    } catch {
      // Fall through to fetch current server cart
    }
  }

  try {
    const data = await apiClient.get<unknown>("/cart");
    const serverItems = normalizeServerCartItems(data);
    dispatch(setCart(serverItems));
  } catch {
    // Retain existing state if network is unavailable
  }
}

/**
 * Adds an item to the cart (server or local guest).
 */
export async function addGadgetToCart({
  product,
  variant,
  isAuthenticated,
  dispatch,
}: {
  product: PublicProduct;
  variant: PublicVariant;
  isAuthenticated: boolean;
  dispatch: Dispatch<Action>;
}): Promise<{ mode: CartStorageMode; item: CartItem }> {
  const item = buildCartItem(product, variant);
  if (
    item.availability === "sourcing" ||
    item.availability === "out_of_stock"
  ) {
    throw new Error("This item is not currently available to add to cart.");
  }

  if (isAuthenticated) {
    dispatch(addToCart(item));
    try {
      await apiClient.post<unknown>("/cart/items", {
        body: { sku: item.sku, quantity: 1 },
      });
    } catch (error) {
      dispatch(removeFromCart(item.sku));
      throw error;
    }
    return { mode: "server", item };
  }

  const cart = safeGuestCart();
  const existing = cart.find(
    (entry) => entry.sku === item.sku || entry.variantId === item.variantId,
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }
  saveGuestCart(cart);
  dispatch(addToCart(item));
  return { mode: "guest", item };
}

/**
 * Changes quantity with optimistic Redux updates and backend persistence.
 */
export async function changeCartItemQuantity({
  sku,
  quantity,
  previousQuantity,
  isAuthenticated,
  dispatch,
}: {
  sku: string;
  quantity: number;
  previousQuantity: number;
  isAuthenticated: boolean;
  dispatch: Dispatch<Action>;
}): Promise<void> {
  if (quantity < 1) return;

  dispatch(updateQuantity({ sku, quantity }));

  if (isAuthenticated) {
    try {
      await apiClient.patch<unknown>(`/cart/items/${encodeURIComponent(sku)}`, {
        body: { quantity },
      });
    } catch (error) {
      dispatch(updateQuantity({ sku, quantity: previousQuantity }));
      throw error;
    }
  } else {
    const cart = safeGuestCart();
    const item = cart.find(
      (entry) => entry.sku === sku || entry.variantId === sku,
    );
    if (item) {
      item.quantity = quantity;
      saveGuestCart(cart);
    }
  }
}

/**
 * Removes an item with optimistic Redux updates and backend persistence.
 */
export async function removeCartItemAction({
  item,
  isAuthenticated,
  dispatch,
}: {
  item: CartItem;
  isAuthenticated: boolean;
  dispatch: Dispatch<Action>;
}): Promise<void> {
  dispatch(removeFromCart(item.sku));

  if (isAuthenticated) {
    try {
      await apiClient.delete<unknown>(
        `/cart/items/${encodeURIComponent(item.sku)}`,
      );
    } catch (error) {
      dispatch(addToCart(item));
      throw error;
    }
  } else {
    const cart = safeGuestCart().filter(
      (entry) => entry.sku !== item.sku && entry.variantId !== item.variantId,
    );
    saveGuestCart(cart);
  }
}
