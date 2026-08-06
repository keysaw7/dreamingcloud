import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('accessibilité', () => {
  for (const route of ['/', '/auth/login']) {
    test(`${route} ne présente aucune violation axe critique`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.filter((violation) =>
          ['critical', 'serious'].includes(violation.impact ?? ''),
        ),
      ).toEqual([]);
    });
  }
});
