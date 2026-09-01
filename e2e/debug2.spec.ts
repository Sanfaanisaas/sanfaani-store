import { test } from '@playwright/test';

test('debug PDP', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.route("**/api/products*", async (route) => {
    const url = route.request().url();
    if (url.includes("macbook-pro-14")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "prod-1",
            name: "MacBook Pro 14",
            slug: "macbook-pro-14",
            description: "M2 Pro 16GB 512GB",
            category: "Laptops",
            brand: "Apple",
            images: [],
            variants: [
              {
                id: "var-1",
                sku: "MBP-14-SILVER",
                price: 1200000,
                condition: "refurbished_grade_a",
                availability: "in_stock",
                attributes: { Colour: "Silver" },
              },
            ],
          },
        }),
      });
    }
    return route.continue();
  });

  await page.goto('http://127.0.0.1:3000/shop/macbook-pro-14');
  await page.waitForTimeout(3000);
});
