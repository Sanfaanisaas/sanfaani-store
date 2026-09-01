import type { PublicProduct, PublicVariant } from "@/lib/api/contracts";
import { fetchProducts } from "@/lib/api/productsApi";
import { mergeGuestCart, fetchCart, type GuestCartEntry } from "@/lib/api/cartApi";
import type { NormalizedCartLine } from "@/lib/api/normalizers/cartNormalizer";
import { ApiError } from "@/lib/api/client";
import {
  clearGuestCartStorage,
  readGuestCartStorage,
  writeGuestCartStorage,
  type GuestCartStoredItem,
} from "@/lib/functions/guestCartStorage";
import type { AppDispatch } from "@/lib/redux/store";
import {
  markGuestMerged,
  replaceCart,
  resetGuestMerged,
  setCartConflicts,
  setCartError,
  setCartStatus,
  type CartConflict,
  type CartItem,
} from "@/lib/redux/slices/cartSlice";

function toCartItem(line: NormalizedCartLine): CartItem {
  return {
    productId: line.productId,
    variantId: line.variantId,
    sku: line.variantSku,
    name: line.name,
    price: line.price,
    priceAtAdd: line.priceAtAdd,
    priceChanged: line.priceChanged,
    quantity: line.quantity,
    availability: line.availability,
    maxStock: line.canFulfillQuantity ? line.quantity : 0,
  };
}

function toCartItems(lines: NormalizedCartLine[]): CartItem[] {
  return lines.map(toCartItem);
}

function conflictsFromError(error: unknown): CartConflict[] {
  if (!(error instanceof ApiError) || error.kind !== "conflict") return [];
  return Object.entries(error.fieldErrors).map(([path, message]) => ({
    type: path || "conflict",
    message,
  }));
}

async function resolveGuestItemsFromCatalogue(stored: GuestCartStoredItem[]): Promise<CartItem[]> {
  const remaining = new Map(stored.map((item) => [item.variantId, item.quantity]));
  const resolved: CartItem[] = [];
  let page = 1;
  let pages = 1;

  while (page <= pages && remaining.size > 0) {
    const response = await fetchProducts(page, 50);
    pages = response.pagination.pages;
    for (const product of response.products) {
      for (const variant of product.variants) {
        const quantity = remaining.get(variant.id);
        if (!quantity) continue;
        if (variant.availability === "sourcing" || variant.availability === "out_of_stock") {
          remaining.delete(variant.id);
          continue;
        }
        resolved.push({
          productId: product.id,
          variantId: variant.id,
          sku: variant.sku,
          name: product.name,
          image: product.images[0],
          price: variant.price,
          quantity,
          availability: variant.availability,
        });
        remaining.delete(variant.id);
      }
    }
    page += 1;
  }

  writeGuestCartStorage(
    [...remaining.entries()].map(([variantId, quantity]) => ({ variantId, quantity })),
  );
  return resolved;
}

export async function hydrateGuestCart(dispatch: AppDispatch) {
  const stored = readGuestCartStorage();
  if (!stored.length) {
    dispatch(setCartStatus("empty"));
    return;
  }
  dispatch(setCartStatus("hydrating"));
  try {
    const items = await resolveGuestItemsFromCatalogue(stored);
    dispatch(replaceCart(items));
    writeGuestCartStorage(stored.filter((entry) => items.some((item) => item.variantId === entry.variantId)));
  } catch {
    dispatch(setCartError("We could not restore your saved cart."));
  }
}

export async function loadAuthenticatedCart(dispatch: AppDispatch) {
  dispatch(setCartStatus("loading"));
  try {
    const cart = await fetchCart();
    dispatch(replaceCart(toCartItems(cart.items)));
  } catch (error) {
    if (error instanceof ApiError && error.kind === "unauthorized") {
      dispatch(setCartStatus("unauthorized"));
      return;
    }
    dispatch(setCartError("Your cart is temporarily unavailable."));
  }
}

export async function mergeGuestIntoAuthenticatedCart(dispatch: AppDispatch, alreadyMerged: boolean) {
  const guestItems = readGuestCartStorage();
  if (!guestItems.length || alreadyMerged) {
    await loadAuthenticatedCart(dispatch);
    return;
  }

  dispatch(setCartStatus("merging"));
  try {
    const merged = await mergeGuestCart(guestItems as GuestCartEntry[], crypto.randomUUID());
    dispatch(replaceCart(toCartItems(merged.items)));
    clearGuestCartStorage();
    dispatch(markGuestMerged());
  } catch (error) {
    dispatch(setCartConflicts(conflictsFromError(error)));
    dispatch(setCartError(error instanceof ApiError ? error.message : "Some guest items could not be merged."));
    await loadAuthenticatedCart(dispatch);
  }
}

export function persistGuestCart(items: CartItem[]) {
  writeGuestCartStorage(items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })));
}

export function clearAllCartState(dispatch: AppDispatch) {
  clearGuestCartStorage();
  dispatch(resetGuestMerged());
  dispatch(replaceCart([]));
  dispatch(setCartStatus("idle"));
  dispatch(setCartError(null));
  dispatch(setCartConflicts([]));
}

export function findVariantInProduct(product: PublicProduct, variant: PublicVariant) {
  return product.variants.find((entry) => entry.id === variant.id) ?? variant;
}
