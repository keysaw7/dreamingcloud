import { expect, test } from '@playwright/test';

test.describe('MVP smoke', () => {
  test('home page renders in French', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'DreamingCloud' }).first()).toBeVisible();
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Découvrir' }).first(),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Découvrir' })).toBeVisible();
  });

  test('login form exposes accessible labels', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('protected following page asks for login when anonymous', async ({ page }) => {
    await page.goto('/following');
    await expect(page.getByRole('heading', { name: 'Suivis' })).toBeVisible();
    await expect(page.getByText(/Connectez-vous pour voir le fil/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Connexion' }).first()).toBeVisible();
  });
});
