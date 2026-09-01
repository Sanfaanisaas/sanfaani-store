import { expect, test } from "@playwright/test";

test.describe("Phase 1 customer journeys", () => {
  test("catalogue filters persist in the URL", async ({ page }) => {
    await page.goto("/shop?q=laptop&condition=new&sort=price_asc");
    await expect(page).toHaveURL(/q=laptop/);
    await expect(page).toHaveURL(/condition=new/);
    await expect(page.getByRole("heading", { name: "Shop devices and repair services" })).toBeVisible();
  });

  test("order tracking entry does not place credentials in the URL", async ({ page }) => {
    await page.goto("/orders/track");
    await page.getByLabel("Order reference").fill("64f1f77bcf86cd799439011");
    await page.getByRole("button", { name: "Continue securely" }).click();
    await expect(page).toHaveURL(/\/login|\/account\/orders\//, { timeout: 15000 });
    expect(page.url()).not.toMatch(/token|credential|secret/i);
  });

  test("checkout requires authentication", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
