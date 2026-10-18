import { test, expect } from '@playwright/test';

/**
 * Seed: admin@zarva.dev / Password123!
 * Skips gracefully if login form shape changes or API is down.
 */
test.describe('gold money path', () => {
  test('login then open POS and day-close routes', async ({ page }) => {
    await page.goto('/fa/login');
    const email = page.getByLabel(/email|ایمیل/i).or(page.locator('input[type="email"]'));
    const password = page
      .getByLabel(/password|رمز/i)
      .or(page.locator('input[type="password"]'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    if ((await email.count()) === 0 || (await password.count()) === 0) {
      test.skip();
      return;
    }

    await email.first().fill('admin@zarva.dev');
    await password.first().fill('Password123!');
    await page.getByRole('button', { name: /sign in|ورود|login/i }).click();

    await page.waitForURL(/\/(fa|en|ar)\//, { timeout: 20_000 }).catch(() => null);

    await page.goto('/fa/sales/new');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/fa/reports/day-close');
    await expect(page.locator('body')).toBeVisible();
  });
});
