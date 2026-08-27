import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AvailabilityState =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "sourcing";

export interface CartItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  maxStock?: number;
  availability: AvailabilityState;
}

const initialState: CartItem[] = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // BE-01 Guard: Sourcing & Out-of-stock variants cannot enter a cart
      if (
        action.payload.availability === "sourcing" ||
        action.payload.availability === "out_of_stock"
      ) {
        return;
      }

      const existingItem = state.find(
        (item) => item.variantId === action.payload.variantId,
      );

      if (existingItem) {
        const targetQuantity = existingItem.quantity + action.payload.quantity;
        // Cap quantity to available stock if provided
        if (existingItem.maxStock !== undefined) {
          existingItem.quantity = Math.min(
            targetQuantity,
            existingItem.maxStock,
          );
        } else {
          existingItem.quantity = targetQuantity;
        }
      } else {
        const initialQty =
          action.payload.maxStock !== undefined
            ? Math.min(action.payload.quantity, action.payload.maxStock)
            : action.payload.quantity;

        state.push({
          ...action.payload,
          quantity: Math.max(1, initialQty),
        });
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) => {
      const item = state.find(
        (entry) => entry.variantId === action.payload.variantId,
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          return state.filter(
            (entry) => entry.variantId !== action.payload.variantId,
          );
        }

        if (item.maxStock !== undefined) {
          item.quantity = Math.min(action.payload.quantity, item.maxStock);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      return state.filter((item) => item.variantId !== action.payload);
    },
    clearCart: () => {
      return [];
    },
    syncCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      // Filter out any stored items that have turned into sourcing variants
      const validIncoming = action.payload.filter(
        (item) =>
          item.availability !== "sourcing" &&
          item.availability !== "out_of_stock",
      );

      const merged = [...state];

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

      return merged;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCartFromStorage,
} = cartSlice.actions;
export default cartSlice.reducer;
