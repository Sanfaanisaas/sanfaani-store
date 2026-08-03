import axiosInstance from "@/lib/api/axiosInstance";
import { addToCart, removeFromCart } from "@/lib/redux/slices/cartSlice";
import type { AppDispatch } from "@/lib/redux/store";

export type CartStorageMode = "cartSlice" | "localStorage";

export interface CartItemPayload {
  /** Variant _id — used as the dedup key and for merge-on-login */
  variantId: string;
  /** Product _id — needed for the server's POST /cart/items call */
  productId: string;
  /** Variant SKU — needed for the server's POST /cart/items call */
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
}

export function buildCartItem(gadget: any): CartItemPayload {
  const variant = gadget.variants?.[0];
  return {
    variantId: variant?._id || gadget._id || gadget.id,
    productId: gadget._id || gadget.id,
    variantSku: variant?.sku || "",
    name: gadget.name,
    price: variant?.price || gadget.price || 0,
    quantity: 1,
  };
}

export async function addGadgetToCart({
  gadget,
  isAuthenticated,
  dispatch,
}: {
  gadget: any;
  isAuthenticated: boolean;
  dispatch: AppDispatch;
}): Promise<{ mode: CartStorageMode; item: CartItemPayload }> {
  const item = buildCartItem(gadget);

  if (isAuthenticated) {
    // Optimistic: dispatch to Redux immediately for instant UI feedback.
    dispatch(addToCart(item));

    try {
      await axiosInstance.post("/cart/items", {
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
      });
    } catch {
      // Revert the optimistic update so Redux and server don't diverge.
      dispatch(removeFromCart(item.variantId));
      throw new Error("Failed to add item to cart. Please try again.");
    }

    return { mode: "cartSlice", item };
  }

  if (typeof window !== "undefined") {
    const existing = window.localStorage.getItem("guestCart");
    const parsed: CartItemPayload[] = existing ? JSON.parse(existing) : [];
    const existingItem = parsed.find((entry) => entry.variantId === item.variantId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      parsed.push(item);
    }

    window.localStorage.setItem("guestCart", JSON.stringify(parsed));
  }

  return { mode: "localStorage", item };
}
