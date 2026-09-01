import assert from "node:assert/strict";
import test from "node:test";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logoutUser } from "../../src/lib/redux/slices/authSlice";
import cartReducer from "../../src/lib/redux/slices/cartSlice";

test("logout clears cart ownership state", async () => {
  const store = configureStore({ reducer: { auth: authReducer, cart: cartReducer } });
  store.dispatch({
    type: "cart/addToCart",
    payload: {
      productId: "p1",
      variantId: "v1",
      sku: "SKU-1",
      name: "Phone",
      price: 100,
      quantity: 1,
      availability: "in_stock",
    },
  });
  assert.equal(store.getState().cart.items.length, 1);
  await store.dispatch(logoutUser());
  assert.equal(store.getState().cart.items.length, 0);
  assert.equal(store.getState().auth.isAuthenticated, false);
});
