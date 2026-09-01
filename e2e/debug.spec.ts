import { test } from '@playwright/test';
test('log console', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));
  await page.goto('http://127.0.0.1:3000/shop');
  await page.waitForTimeout(3000);
});
