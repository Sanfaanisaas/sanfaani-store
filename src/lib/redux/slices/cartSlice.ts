import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  variantId: string;
  name: string;
  price: number;
  quantity: number;
}

const initialState: CartItem[] = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.find((item) => item.variantId === action.payload.variantId);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.push(action.payload);
      }
    },
    updateQuantity: (state, action: PayloadAction<{ variantId: string; quantity: number }>) => {
      const item = state.find((entry) => entry.variantId === action.payload.variantId);

      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      return state.filter((item) => item.variantId !== action.payload);
    },
    clearCart: () => {
      return [];
    },
    syncCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      const merged = [...state];

      action.payload.forEach((item) => {
        const existingItem = merged.find((entry) => entry.variantId === item.variantId);

        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          merged.push(item);
        }
      });

      return merged;
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, syncCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
