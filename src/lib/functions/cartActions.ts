import axiosInstance from "@/lib/api/axiosInstance";
import {
  addToCart,
  removeFromCart,
  type CartItem,
  type AvailabilityState,
} from "@/lib/redux/slices/cartSlice";
import type { AppDispatch } from "@/lib/redux/store";

export type CartStorageMode = "cartSlice" | "localStorage";

// Re-use the exact CartItem interface from the slice to ensure payload consistency
export type CartItemPayload = CartItem;

export function buildCartItem(
  gadget: any,
  selectedVariantId?: string,
): CartItemPayload {
  // If a specific variant is selected via the UI, find it. Otherwise, default to the first.
  const variant = selectedVariantId
    ? gadget.variants?.find(
        (v: any) => v._id === selectedVariantId || v.id === selectedVariantId,
      )
    : gadget.variants?.[0];

  return {
    variantId: variant?._id || variant?.id || gadget._id || gadget.id,
    productId: gadget._id || gadget.id,
    sku: variant?.sku || "",
    name: gadget.name,
    image: gadget.images?.[0],
    price: variant?.price ?? gadget.price ?? 0,
    quantity: 1,
    maxStock: variant?.stock_count,
    availability: (variant?.availability ||
      "out_of_stock") as AvailabilityState,
  };
}

export async function addGadgetToCart({
  gadget,
  selectedVariantId,
  isAuthenticated,
  dispatch,
}: {
  gadget: any;
  selectedVariantId?: string;
  isAuthenticated: boolean;
  dispatch: AppDispatch;
}): Promise<{ mode: CartStorageMode; item: CartItemPayload }> {
  const item = buildCartItem(gadget, selectedVariantId);

  // BE-01 Guard: Prevent sourcing/out-of-stock items from entering any cart state
  if (
    item.availability === "sourcing" ||
    item.availability === "out_of_stock"
  ) {
    throw new Error(
      `Cannot add this item to cart. Current status: ${item.availability.replace("_", " ")}`,
    );
  }

  if (isAuthenticated) {
    // Optimistic: dispatch to Redux immediately for instant UI feedback.
    dispatch(addToCart(item));

    try {
      await axiosInstance.post("/cart/items", {
        productId: item.productId,
        variantSku: item.sku,
        quantity: item.quantity,
      });
    } catch (error) {
      // Revert the optimistic update so Redux and server don't diverge.
      dispatch(removeFromCart(item.variantId));
      throw new Error(
        "Failed to reserve item on the server. Please try again.",
      );
    }

    return { mode: "cartSlice", item };
  }

  // Unauthenticated Flow: localStorage with stock enforcement
  if (typeof window !== "undefined") {
    const existing = window.localStorage.getItem("guestCart");
    const parsed: CartItemPayload[] = existing ? JSON.parse(existing) : [];
    const existingItemIndex = parsed.findIndex(
      (entry) => entry.variantId === item.variantId,
    );

    if (existingItemIndex >= 0) {
      const existingItem = parsed[existingItemIndex];
      const targetQty = existingItem.quantity + item.quantity;

      // Enforce maxStock limit for guest cart just like Redux does
      existingItem.quantity =
        existingItem.maxStock !== undefined
          ? Math.min(targetQty, existingItem.maxStock)
          : targetQty;
    } else {
      parsed.push(item);
    }

    window.localStorage.setItem("guestCart", JSON.stringify(parsed));
    // Also dispatch to Redux so the UI updates instantly for guests
    dispatch(addToCart(item));
  }

  return { mode: "localStorage", item };
}
