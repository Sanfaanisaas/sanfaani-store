import { addCartItem, removeCartItem, setCartItemQuantity } from "@/lib/api/cartApi";
import type { PublicProduct, PublicVariant } from "@/lib/api/contracts";
import { persistGuestCart } from "@/lib/functions/cartSync";
import { readGuestCartStorage, writeGuestCartStorage } from "@/lib/functions/guestCartStorage";
import {
  addToCart,
  removeFromCart,
  replaceCart,
  setPendingVariant,
  updateQuantity,
  type CartItem,
} from "@/lib/redux/slices/cartSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";

export type CartStorageMode = "server" | "guest";

export function buildCartItem(product: PublicProduct, variant: PublicVariant, quantity = 1): CartItem {
  return {
    productId: product.id,
    variantId: variant.id,
    sku: variant.sku,
    name: product.name,
    image: product.images[0],
    price: variant.price,
    quantity,
    availability: variant.availability,
  };
}

export async function addGadgetToCart({
  product,
  variant,
  isAuthenticated,
  dispatch,
  getState,
}: {
  product: PublicProduct;
  variant: PublicVariant;
  isAuthenticated: boolean;
  dispatch: AppDispatch;
  getState: () => RootState;
}): Promise<{ mode: CartStorageMode; item: CartItem }> {
  const item = buildCartItem(product, variant);
  if (item.availability === "sourcing" || item.availability === "out_of_stock") {
    throw new Error("This item is not currently available to add to a cart.");
  }

  if (isAuthenticated) {
    dispatch(setPendingVariant({ variantId: item.variantId, pending: true }));
    dispatch(addToCart(item));
    try {
      await addCartItem({ productId: product.id, variantSku: variant.sku, quantity: 1 }, crypto.randomUUID());
    } catch (error) {
      dispatch(removeFromCart(item.variantId));
      throw error;
    } finally {
      dispatch(setPendingVariant({ variantId: item.variantId, pending: false }));
    }
    return { mode: "server", item };
  }

  const stored = readGuestCartStorage();
  const existing = stored.find((entry) => entry.variantId === item.variantId);
  if (existing) existing.quantity += 1;
  else stored.push({ variantId: item.variantId, quantity: 1 });
  writeGuestCartStorage(stored);
  dispatch(addToCart(item));
  persistGuestCart(getState().cart.items);
  return { mode: "guest", item };
}

function linesToCartItems(lines: Awaited<ReturnType<typeof setCartItemQuantity>>["items"]) {
  return lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    sku: line.variantSku,
    name: line.name,
    price: line.price,
    priceAtAdd: line.priceAtAdd,
    priceChanged: line.priceChanged,
    quantity: line.quantity,
    availability: line.availability,
  }));
}

export async function updateCartQuantity({
  variantId,
  variantSku,
  quantity,
  isAuthenticated,
  dispatch,
  getState,
}: {
  variantId: string;
  variantSku: string;
  quantity: number;
  isAuthenticated: boolean;
  dispatch: AppDispatch;
  getState: () => RootState;
}) {
  const previous = getState().cart.items.find((item) => item.variantId === variantId);
  dispatch(setPendingVariant({ variantId, pending: true }));
  dispatch(updateQuantity({ variantId, quantity }));
  if (!isAuthenticated) {
    persistGuestCart(getState().cart.items);
    dispatch(setPendingVariant({ variantId, pending: false }));
    return;
  }
  try {
    const cart = await setCartItemQuantity(variantSku, quantity, crypto.randomUUID());
    dispatch(replaceCart(linesToCartItems(cart.items)));
  } catch (error) {
    if (previous) dispatch(addToCart(previous));
    throw error;
  } finally {
    dispatch(setPendingVariant({ variantId, pending: false }));
  }
}

export async function removeCartLine({
  variantId,
  variantSku,
  isAuthenticated,
  dispatch,
  getState,
}: {
  variantId: string;
  variantSku: string;
  isAuthenticated: boolean;
  dispatch: AppDispatch;
  getState: () => RootState;
}) {
  const previous = getState().cart.items.find((item) => item.variantId === variantId);
  dispatch(removeFromCart(variantId));
  if (!isAuthenticated) {
    persistGuestCart(getState().cart.items);
    return;
  }
  dispatch(setPendingVariant({ variantId, pending: true }));
  try {
    const cart = await removeCartItem(variantSku, crypto.randomUUID());
    dispatch(replaceCart(linesToCartItems(cart.items)));
  } catch (error) {
    if (previous) dispatch(addToCart(previous));
    throw error;
  } finally {
    dispatch(setPendingVariant({ variantId, pending: false }));
  }
}
