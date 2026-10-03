import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('login page responds', async ({ page }) => {
    await page.goto('/fa/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
