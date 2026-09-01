import assert from "node:assert/strict";
import test from "node:test";
import { parseGuestCartStorage } from "../../src/lib/functions/guestCartStorage";

test("guest cart storage keeps only safe identifiers and quantities", () => {
  const parsed = parseGuestCartStorage(JSON.stringify([
    { variantId: "64f1f77bcf86cd799439011", quantity: 2 },
    { variantId: "", quantity: 1 },
    { variantId: "64f1f77bcf86cd799439012", quantity: 0 },
    { price: 999, variantId: "64f1f77bcf86cd799439013", quantity: 1 },
  ]));
  assert.deepEqual(parsed, [
    { variantId: "64f1f77bcf86cd799439011", quantity: 2 },
    { variantId: "64f1f77bcf86cd799439013", quantity: 1 },
  ]);
});

test("malformed guest cart storage is rejected", () => {
  assert.deepEqual(parseGuestCartStorage("{not-json"), []);
});
