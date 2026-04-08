import { test, expect } from '@playwright/test';

test('Analyze page loads with camera tab', async ({ page }) => {
  await page.goto('/analyze', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('h1')).toContainText('Plant Disease Analysis', { timeout: 10000 });
  await expect(page.getByText('Image-Based Analysis')).toBeVisible({ timeout: 5000 });
  await page.getByRole('tab', { name: /Camera/i }).click();
  await expect(page.getByRole('button', { name: /Open Camera/i })).toBeVisible({ timeout: 5000 });
});
