import assert from "node:assert/strict";
import test from "node:test";
import { parseCatalogueParams } from "../../src/lib/catalogue/catalogueParams";

test("parseCatalogueParams restores supported filters and falls back safely", () => {
  const params = new URLSearchParams("q=laptop&category=laptops&brand=Apple&condition=new&availability=in_stock&minPrice=100&maxPrice=5000&sort=price_asc&page=2&pageSize=24");
  const parsed = parseCatalogueParams(params);
  assert.equal(parsed.q, "laptop");
  assert.equal(parsed.category, "laptops");
  assert.equal(parsed.brand, "Apple");
  assert.equal(parsed.condition, "new");
  assert.equal(parsed.availability, "in_stock");
  assert.equal(parsed.minPrice, 100);
  assert.equal(parsed.maxPrice, 5000);
  assert.equal(parsed.sort, "price_asc");
  assert.equal(parsed.page, 2);
  assert.equal(parsed.pageSize, 24);
});

test("parseCatalogueParams rejects invalid filter values", () => {
  const parsed = parseCatalogueParams(new URLSearchParams("condition=invalid&availability=bad&sort=unknown&page=-1"));
  assert.equal(parsed.condition, "All");
  assert.equal(parsed.availability, "All");
  assert.equal(parsed.sort, "newest");
  assert.equal(parsed.page, 1);
});
