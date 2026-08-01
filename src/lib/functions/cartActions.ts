import { addToCart } from "@/lib/redux/slices/cartSlice";
import type { AppDispatch } from "@/lib/redux/store";

export type CartStorageMode = "cartSlice" | "localStorage";

export interface CartItemPayload {
  variantId: string;
  name: string;
  price: number;
  quantity: number;
}

export function buildCartItem(gadget: any): CartItemPayload {
  return {
    variantId: gadget.id || gadget._id,
    name: gadget.name,
    price: gadget.variants?.[0]?.price || gadget.price || 0,
    quantity: 1,
  };
}

export function addGadgetToCart({
  gadget,
  isAuthenticated,
  dispatch,
}: {
  gadget: any;
  isAuthenticated: boolean;
  dispatch: AppDispatch;
}): { mode: CartStorageMode; item: CartItemPayload } {
  const item = buildCartItem(gadget);

  if (isAuthenticated) {
    dispatch(addToCart(item));
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
