import { expect, test, type Page } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const PASSWORD = 'DemoPass123!';

async function login(page: Page, email: string) {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL((url) => url.pathname === '/');
  const sidebar = page.getByRole('complementary');
  await expect(
    sidebar.getByText(email === 'lea@demo.local' ? 'Léa Martin' : 'Noah Bernard'),
  ).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Profil' })).toBeVisible();
}

test.describe('MVP flow', () => {
  test('home and discover are usable anonymously', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'DreamingCloud' }).first()).toBeVisible();
    await page.getByRole('navigation').getByRole('link', { name: 'Découvrir' }).first().click();
    await expect(page.getByRole('heading', { name: 'Découvrir' })).toBeVisible();
  });

  test('owner publishes aspiration and contributor helps through confirmation', async ({
    browser,
  }) => {
    const ownerContext = await browser.newContext();
    const contributorContext = await browser.newContext();
    const owner = await ownerContext.newPage();
    const contributor = await contributorContext.newPage();

    await login(owner, 'lea@demo.local');
    await owner.goto('/aspirations/new');
    const unique = Date.now();
    const title = `Rêve e2e ${unique}`;
    await owner.getByLabel('Titre').fill(title);
    await owner
      .getByLabel('Histoire')
      .fill(
        'Ceci est une aspiration de test bout en bout pour valider le parcours MVP DreamingCloud.',
      );
    await owner.getByRole('button', { name: 'Continuer' }).click();
    await owner.getByPlaceholder('Titre du besoin').fill('Aide technique');
    await owner.getByRole('button', { name: 'Continuer' }).click();
    const publishResponse = owner.waitForResponse(
      (response) =>
        response.url().includes('/publish') &&
        response.request().method() === 'POST' &&
        response.ok(),
    );
    await owner.getByRole('button', { name: 'Publier mon rêve' }).click();
    await publishResponse;
    await owner.waitForURL(
      (url) => url.pathname.startsWith('/aspirations/') && url.pathname !== '/aspirations/new',
    );
    await expect(owner.getByRole('heading', { level: 1, name: title })).toBeVisible();

    const aspirationUrl = owner.url();
    expect(aspirationUrl).not.toMatch(/\/aspirations\/new(?:\?|$)/);

    await login(contributor, 'noah@demo.local');
    await contributor.goto(aspirationUrl);
    await expect(contributor.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await contributor.getByRole('button', { name: 'Je soutiens' }).click();
    await contributor.getByLabel('Commentaire').fill('Bravo pour ce projet, je te soutiens !');
    await contributor.getByRole('button', { name: 'Publier le commentaire' }).click();
    await expect(contributor.getByText('Bravo pour ce projet')).toBeVisible();

    await contributor.getByRole('button', { name: 'Proposer mon aide' }).click();
    await contributor.getByLabel('Description').fill('Je peux contribuer plusieurs soirées.');
    await contributor.getByRole('button', { name: 'Envoyer la proposition' }).click();
    await expect(contributor.getByText('Contribution proposée')).toBeVisible();

    await owner.goto(aspirationUrl);
    await owner.getByRole('button', { name: 'Accepter' }).first().click();
    await expect(owner.getByText(/Contribution → accepted/i)).toBeVisible();
    await owner.getByRole('button', { name: 'Démarrer' }).first().click();
    await owner.getByRole('button', { name: 'Confirmer la réalisation' }).first().click();
    await expect(owner.getByText(/En attente de la confirmation/i)).toBeVisible();

    await contributor.goto(aspirationUrl);
    await contributor.getByRole('button', { name: 'Confirmer la réalisation' }).first().click();

    const conversationLink = contributor.getByRole('link', { name: 'Conversation' }).first();
    if (await conversationLink.isVisible()) {
      await conversationLink.click();
      await contributor.getByRole('textbox').fill('Message e2e de confirmation.');
      await contributor.getByRole('button', { name: /Envoyer|envoyer/i }).click();
    }

    await ownerContext.close();
    await contributorContext.close();
  });

  test('admin can list moderation reports', async ({ request, page }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'admin@demo.local', password: PASSWORD },
    });
    expect(loginResponse.ok()).toBeTruthy();

    await page.goto('/auth/login');
    await page.getByLabel('E-mail').fill('admin@demo.local');
    await page.getByLabel('Mot de passe').fill(PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL((url) => url.pathname === '/');
    await page.goto('/admin/reports');
    await expect(page.getByRole('heading', { name: 'Signalements ouverts' })).toBeVisible();
  });
});
