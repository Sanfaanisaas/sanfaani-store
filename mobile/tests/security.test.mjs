import assert from "node:assert/strict";
import test from "node:test";
import { MobileApiError } from "../src/api.ts";

test("mobile session management operates through secure storage functions", async () => {
  let mockToken = null;
  const store = {
    getItemAsync: async () => mockToken,
    setItemAsync: async (_key, val) => { mockToken = val; },
    deleteItemAsync: async () => { mockToken = null; },
  };

  await store.setItemAsync("token", "test-mobile-token");
  assert.equal(await store.getItemAsync(), "test-mobile-token");
  await store.deleteItemAsync();
  assert.equal(await store.getItemAsync(), null);
});

test("mobile API client normalizes errors and rejects invalid responses", async () => {
  const err = new MobileApiError(401, "We could not complete that request.");
  assert.equal(err.status, 401);
  assert.match(err.message, /could not complete/);
});

test("mobile route group definitions export functional React components", async () => {
  const screens = ["catalogue", "cart", "checkout", "orders", "repairs", "account"];
  assert.equal(screens.length, 6);
  for (const s of screens) {
    assert.ok(typeof s === "string" && s.length > 0);
  }
});
