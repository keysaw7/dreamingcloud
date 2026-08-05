import { expect, test } from '@playwright/test';

test.describe('MVP smoke', () => {
  test('home page renders in French', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'DreamingCloud' })).toBeVisible();
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Découvrir' }),
    ).toBeVisible();
  });
});
