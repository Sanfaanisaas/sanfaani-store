import { expect, test } from "@playwright/test";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Repair", href: "/repair/request" },
  { label: "Track order", href: "/orders/track" },
  { label: "Support", href: "/support" },
];

const footerLinks = [
  "/shop",
  "/repair/request",
  "/repair/track",
  "/orders/track",
  "/support",
  "/policies/terms",
  "/policies/privacy",
  "/policies/warranty",
];

test.describe("Route integrity", () => {
  for (const link of navLinks) {
    test("navbar link resolves: " + link.href, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: link.label, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(link.href.replace("/", "\\/") + "(\\?.*)?$"));
    });
  }

  for (const href of footerLinks) {
    test("footer link resolves: " + href, async ({ page }) => {
      const response = await page.goto(href);
      expect(response?.status()).toBeLessThan(400);
    });
  }
});

test("mobile drawer supports escape and restores focus @a11y", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await toggle.focus();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("active route is exposed with aria-current", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("link", { name: "Shop" }).first()).toHaveAttribute("aria-current", "page");
});
