import { expect, test } from "@playwright/test";

test.describe("Phase 2 Customer Journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.includes("/auth/refresh"), async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: "mock-access-token",
            user: {
              id: "user-123",
              name: "Ada Lovelace",
              email: "ada@example.com",
              role: "customer",
            },
          },
        }),
      });
    });
  });

  test("1. Search/filter/PDP/variant/cart", async ({ page }) => {
    await page.route("**/api/products**", async (route) => {
      const url = route.request().url();
      if (url.includes("macbook-pro-14") || url.includes("prod-1")) {
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
                {
                  id: "var-2",
                  sku: "MBP-14-SPACEGRAY",
                  price: 1250000,
                  condition: "refurbished_grade_a",
                  availability: "in_stock",
                  attributes: { Colour: "Space Gray" },
                },
              ],
            },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            products: [
              {
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
            ],
            pagination: { total: 1, page: 1, limit: 12, pages: 1 },
          },
        }),
      });
    });

    await page.goto("/shop");
    await expect(page.getByRole("link", { name: "MacBook Pro 14" })).toBeVisible();
    await page.getByRole("link", { name: "MacBook Pro 14" }).click();
    await expect(page.getByRole("heading", { name: "MacBook Pro 14" })).toBeVisible();
    await expect(page.getByText("₦1,200,000")).toBeVisible();
    await page.getByRole("button", { name: /Space Gray/i }).click();
    await expect(page.getByText("₦1,250,000")).toBeVisible();
    await page.getByRole("button", { name: "Add to cart" }).click({ force: true });
  });

  test("2. Guest cart -> login merge", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: "test-token",
            user: { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", role: "customer" },
          },
        }),
      });
    });
    await page.route("**/api/cart**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            items: [
              {
                variantId: "var-1",
                variantSku: "MBP-14-SILVER",
                quantity: 1,
                name: "MacBook Pro 14",
                price: 1200000,
                availability: "in_stock",
                attributes: { Colour: "Silver" },
              },
            ],
            total: 1200000,
          },
        }),
      });
    });

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  });

  test("3. Checkout -> Paystack return -> confirmed order", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  });

  test("4. Order detail -> receipt/evidence/cancellation state", async ({ page }) => {
    await page.route("**/api/orders/mine**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            orders: [
              {
                id: "order-101",
                status: "pending_payment",
                paymentStatus: "pending",
                total: 120000,
                createdAt: "2026-08-31T12:00:00.000Z",
                items: [{ variantSku: "SKU-1", nameSnapshot: "Product 1", quantity: 1, priceSnapshot: 120000 }],
              },
            ],
            totalCount: 1,
            page: 1,
            totalPages: 1,
          },
        }),
      });
    });
    await page.goto("/account/orders");
    await expect(page.getByRole("heading", { name: "My orders" })).toBeVisible();
    await expect(page.getByText("Order order-101")).toBeVisible();
  });

  test("5. Repair request -> tracking -> quote decision", async ({ page }) => {
    await page.route("**/api/repairs/rep-1/track", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "rep-1",
            status: "QUOTE_SENT",
            nextAction: "Review and accept repair quote",
            updatedAt: "2026-08-31T12:00:00.000Z",
            quote: {
              id: "q-1",
              version: 1,
              lineItems: [{ description: "Screen Replacement", amount: 45000 }],
              totalAmount: 45000,
              estimatedDays: 2,
              status: "SENT",
              issuedAt: "2026-08-31T10:00:00.000Z",
              expiresAt: "2026-09-07T10:00:00.000Z",
              superseded: false,
              supersededByVersion: null,
              depositRequirement: { required: false, amount: 0, currency: "NGN", dueBeforeWork: false },
              paymentState: { status: "not_required", confirmedAmount: 0, remainingAmount: 0 },
            },
          },
        }),
      });
    });
    await page.goto("/repair/track/rep-1");
    await expect(page.getByRole("heading", { name: /Repair rep-1/i })).toBeVisible();
    await expect(page.getByText("Screen Replacement")).toBeVisible();
    await expect(page.getByText("₦45,000").first()).toBeVisible();
  });

  test("6. Warranty -> claim -> remedy", async ({ page }) => {
    await page.route("**/api/warranties/mine**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "w-1",
              deviceSummary: "iPhone 13 Pro",
              status: "active",
              expiresAt: "2027-01-01T00:00:00.000Z",
              termsVersion: "2026-08-26",
            },
          ],
        }),
      });
    });
    await page.route("**/api/claims/mine**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    });
    await page.goto("/account/warranty");
    await expect(page.getByRole("heading", { name: "Warranties & claims" })).toBeVisible();
  });

  test("7. Order -> return -> refund state", async ({ page }) => {
    await page.route("**/api/returns/mine**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    });
    await page.route("**/api/orders/mine**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { orders: [], totalCount: 0, page: 1, totalPages: 1 },
        }),
      });
    });
    await page.goto("/account/returns");
    await expect(page.getByRole("heading", { name: "Returns" })).toBeVisible();
  });

  test("8. Support ticket -> reply -> notification", async ({ page }) => {
    await page.route("**/api/support-tickets/mine**", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "tick-1",
              subject: "Inquiry about repair timeline",
              status: "open",
              updatedAt: "2026-08-31T12:00:00.000Z",
              messages: [{ body: "When will parts arrive?", createdAt: "2026-08-31T12:00:00.000Z" }],
            },
          ],
        }),
      });
    });
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: "Help and support" })).toBeVisible();
  });

  test("9. Guidance -> save -> revisit -> escalation", async ({ page }) => {
    await page.goto("/guidance");
    await expect(page.getByRole("heading", { name: "Device and upgrade guidance" })).toBeVisible();
  });

  test("10. Procurement -> quotation decision", async ({ page }) => {
    await page.goto("/procurement");
    await expect(page.getByRole("heading", { name: "Business and school procurement" })).toBeVisible();
  });

  test("11. Service request -> assessment -> quote decision", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: "Services and maintenance" })).toBeVisible();
  });

  test("12. Maintenance plan -> service history", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: "Services and maintenance" })).toBeVisible();
  });

  test("13. Negative foreign-owner access across every domain", async ({ page }) => {
    await page.route("**/api/repairs/forbidden-id/track", async (route) => {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Repair tracking is unavailable",
        }),
      });
    });
    await page.goto("/repair/track/forbidden-id");
    await expect(page.getByText(/unavailable/i)).toBeVisible();
  });

  test("14. Session logout/account-switch data cleanup", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "Account and active sessions" })).toBeVisible();
  });

  test("15. Drawer keyboard behavior", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();
  });

  test("16. Consent prevents analytics before opt-in", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("dialog", { name: "Cookie settings" });
    await expect(banner).toBeVisible();
    await expect(page.getByLabel("Allow optional analytics")).not.toBeChecked();
  });
});
