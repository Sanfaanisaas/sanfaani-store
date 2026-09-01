import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCart } from "../../src/lib/api/normalizers/cartNormalizer";

test("normalizeCart maps ids and price fields", () => {
  const cart = normalizeCart({
    items: [{
      productId: "prod1",
      variantId: "var1",
      variantSku: "SKU-1",
      product: { name: "Phone" },
      quantity: 2,
      price: 1200,
      priceAtAdd: 1000,
      priceChanged: true,
      availability: "in_stock",
      canFulfillQuantity: true,
    }],
  });
  assert.equal(cart.items[0]?.variantSku, "SKU-1");
  assert.equal(cart.items[0]?.price, 1200);
  assert.equal(cart.items[0]?.priceChanged, true);
});
