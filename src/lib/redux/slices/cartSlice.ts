import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AvailabilityState =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "sourcing";

export type CartStatus =
  | "idle"
  | "loading"
  | "hydrating"
  | "merging"
  | "syncing"
  | "ready"
  | "empty"
  | "offline"
  | "unauthorized"
  | "error";

export interface CartItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  image?: string;
  price: number;
  priceAtAdd?: number | null;
  priceChanged?: boolean | null;
  quantity: number;
  maxStock?: number;
  availability: AvailabilityState;
}

export interface CartConflict {
  type: string;
  message: string;
  variantSku?: string;
  variantId?: string;
}

export interface CartState {
  items: CartItem[];
  status: CartStatus;
  error: string | null;
  conflicts: CartConflict[];
  pendingVariants: Record<string, boolean>;
  guestMerged: boolean;
}

const initialState: CartState = {
  items: [],
  status: "idle",
  error: null,
  conflicts: [],
  pendingVariants: {},
  guestMerged: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartStatus(state, action: PayloadAction<CartStatus>) {
      state.status = action.payload;
    },
    setCartError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      if (action.payload) state.status = "error";
    },
    setCartConflicts(state, action: PayloadAction<CartConflict[]>) {
      state.conflicts = action.payload;
    },
    setPendingVariant(state, action: PayloadAction<{ variantId: string; pending: boolean }>) {
      if (action.payload.pending) state.pendingVariants[action.payload.variantId] = true;
      else delete state.pendingVariants[action.payload.variantId];
    },
    replaceCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.status = action.payload.length ? "ready" : "empty";
      state.error = null;
      state.conflicts = [];
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (
        action.payload.availability === "sourcing" ||
        action.payload.availability === "out_of_stock"
      ) {
        return;
      }

      const existingItem = state.items.find(
        (item) => item.variantId === action.payload.variantId,
      );

      if (existingItem) {
        const targetQuantity = existingItem.quantity + action.payload.quantity;
        if (existingItem.maxStock !== undefined) {
          existingItem.quantity = Math.min(targetQuantity, existingItem.maxStock);
        } else {
          existingItem.quantity = targetQuantity;
        }
      } else {
        const initialQty =
          action.payload.maxStock !== undefined
            ? Math.min(action.payload.quantity, action.payload.maxStock)
            : action.payload.quantity;

        state.items.push({
          ...action.payload,
          quantity: Math.max(1, initialQty),
        });
      }
      state.status = state.items.length ? "ready" : "empty";
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) => {
      const item = state.items.find(
        (entry) => entry.variantId === action.payload.variantId,
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (entry) => entry.variantId !== action.payload.variantId,
          );
        } else if (item.maxStock !== undefined) {
          item.quantity = Math.min(action.payload.quantity, item.maxStock);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      state.status = state.items.length ? "ready" : "empty";
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.variantId !== action.payload);
      state.status = state.items.length ? "ready" : "empty";
    },
    clearCart: () => initialState,
    syncCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      const validIncoming = action.payload.filter(
        (item) =>
          item.availability !== "sourcing" &&
          item.availability !== "out_of_stock",
      );

      const merged = [...state.items];

      validIncoming.forEach((item) => {
        const existingItem = merged.find(
          (entry) => entry.variantId === item.variantId,
        );

        if (existingItem) {
          const totalQty = existingItem.quantity + item.quantity;
          existingItem.quantity =
            existingItem.maxStock !== undefined
              ? Math.min(totalQty, existingItem.maxStock)
              : totalQty;
        } else {
          merged.push(item);
        }
      });

      state.items = merged;
      state.status = merged.length ? "ready" : "empty";
    },
    markGuestMerged(state) {
      state.guestMerged = true;
    },
    resetGuestMerged(state) {
      state.guestMerged = false;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCartFromStorage,
  replaceCart,
  setCartStatus,
  setCartError,
  setCartConflicts,
  setPendingVariant,
  markGuestMerged,
  resetGuestMerged,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartState = (state: { cart: CartState }) => state.cart;

export default cartSlice.reducer;
