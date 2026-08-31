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
    setCart: (_state, action: PayloadAction<CartItem[]>) => {
      return action.payload.filter(
        (item) =>
          item.availability !== "sourcing" &&
          item.availability !== "out_of_stock",
      );
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (
        action.payload.availability === "sourcing" ||
        action.payload.availability === "out_of_stock"
      ) {
        return;
      }

      const existingItem = state.find(
        (item) =>
          item.sku === action.payload.sku ||
          item.variantId === action.payload.variantId,
      );

      if (existingItem) {
        const targetQuantity = existingItem.quantity + action.payload.quantity;
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
      action: PayloadAction<{ sku: string; quantity: number }>,
    ) => {
      const item = state.find((entry) => entry.sku === action.payload.sku);

      if (item) {
        if (action.payload.quantity <= 0) {
          return state.filter((entry) => entry.sku !== action.payload.sku);
        }

        if (item.maxStock !== undefined) {
          item.quantity = Math.min(action.payload.quantity, item.maxStock);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      return state.filter(
        (item) =>
          item.sku !== action.payload && item.variantId !== action.payload,
      );
    },
    clearCart: () => {
      return [];
    },
    syncCartFromStorage: (_state, action: PayloadAction<CartItem[]>) => {
      return action.payload.filter(
        (item) =>
          item.availability !== "sourcing" &&
          item.availability !== "out_of_stock",
      );
    },
  },
});

export const {
  setCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;
