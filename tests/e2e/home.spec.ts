import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home sequences', () => {
  test('French home shows the six DNA scenes in order', async ({ page }) => {
    await page.goto('/');
    const scenes = await page.locator('[data-dna-scene]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.dnaScene));
    expect(scenes).toEqual(['formation', 'sequencing', 'construction', 'expression', 'lab', 'stabilisation']);
    const headings = page.getByRole('heading', { level: 2 });
    await expect(headings.nth(0)).toHaveText('Six gènes, trois paires.');
    await expect(headings.nth(1)).toHaveText('De l’idée à la production.');
    await expect(headings.nth(2)).toHaveText('Ce que l’ADN produit.');
    await expect(headings.nth(3)).toHaveText('Les mutations.');
    await expect(headings.nth(4)).toHaveText('Prêt à construire.');
    await expect(page.locator('#realisations-accueil').getByText('Co-développé avec Jérémie Zitti', { exact: true })).toBeVisible();
    await expect(page.locator('#realisations-accueil h3')).toHaveText(['Ubbfy', 'ContractIQ', 'ZenLife']);
    await expect(page.locator('#laboratoire [data-exploration-badge]')).toHaveCount(4);
    await expect(page.locator('#projet').getByText(/sous 48 heures/)).toBeVisible();
  });

  test('English home is fully translated', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: 'Six genes, three pairs.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What the DNA produces.' })).toBeVisible();
    await expect(page.locator('#realisations-accueil').getByText('Co-built with Jérémie Zitti', { exact: true })).toBeVisible();
    await expect(page.locator('#projet').getByText(/within 48 hours/)).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/Prêt à construire|Séquencer|sous 48 heures|Co-développé/);
  });

  test('Séquencer reveals the proofs of a pair, with and without JavaScript', async ({ browser }) => {
    test.setTimeout(90_000);
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ javaScriptEnabled });
      const page = await context.newPage();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const pair = page.locator('#adn [data-dna-focus="2"]');
      const proofs = pair.getByRole('list', { name: 'Preuves' });
      await expect(proofs).toBeHidden();
      await pair.getByText('Séquencer').click();
      await expect(proofs).toBeVisible();
      await expect(proofs).toContainText('3 mises à jour réglementaires CNSS');
      await context.close();
    }
  });

  test('the live helix follows the scenes on scroll', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 20_000 });
    await expect(stage).toHaveCSS('position', 'fixed');
    for (const [id, state] of [['#methode', '2'], ['#realisations-accueil', '3'], ['#laboratoire', '4'], ['#projet', '5']]) {
      await page.locator(id).evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await expect(stage).toHaveAttribute('data-dna-scene', state, { timeout: 5000 });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await expect(stage).toHaveAttribute('data-dna-scene', '1', { timeout: 5000 });
  });

  test('below-fold text appears when scrolled into view', async ({ page }) => {
    await page.goto('/');
    const conv = page.getByRole('heading', { name: 'Prêt à construire.' });
    await conv.scrollIntoViewIfNeeded();
    await expect.poll(async () => conv.evaluate((el) => getComputedStyle(el).opacity), { timeout: 15_000 }).toBe('1');
  });

  test('below-fold text is visible even when page scripts never load', async ({ page }) => {
    await page.route('**/_next/static/chunks/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3000);
    const conv = page.getByRole('heading', { name: 'Prêt à construire.' });
    await conv.scrollIntoViewIfNeeded();
    expect(await conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  test('reduced motion: everything visible at once, poster only', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const conv = page.getByRole('heading', { name: 'Prêt à construire.' });
    expect(await conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('[data-dna-stage] img[data-dna-poster]')).toBeVisible();
    await expect(page.locator('[data-dna-stage] canvas')).toHaveCount(0);
  });

  test('mobile menu opens, lists the sections and works without JS', async ({ browser }) => {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width: 360, height: 740 }, javaScriptEnabled });
      const page = await context.newPage();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('[data-mobile-menu] summary').click();
      await expect(page.locator('[data-mobile-menu] nav').getByRole('link', { name: 'Réalisations' })).toBeVisible();
      await context.close();
    }
  });

  test('French home canonical has no /en and alternate en points to /en', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/rostelmissimawu\.com\/?$/);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/);
  });

  for (const path of ['/', '/en']) {
    for (const [width, height] of [[1024, 768], [1440, 900]]) {
      test(`header is 88 px tall at ${width}x${height} on ${path}`, async ({ page, isMobile }) => {
        test.skip(isMobile, 'desktop widths');
        await page.setViewportSize({ width, height });
        await page.goto(path);
        expect(await page.locator('body > header').evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(88);
      });
    }
  }

  test('home canonical and alternates', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en$/);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', /rostelmissimawu\.com\/?$/);
  });

  for (const path of ['/', '/en']) {
    test(`no accessibility violations on the full home ${path}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test('mobile menu closes after a hash link and after client navigation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  await page.goto('/');
  const menu = page.locator('[data-mobile-menu]');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await menu.getByRole('link', { name: 'ADN' }).click();
  await expect(menu).not.toHaveAttribute('open', '');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await menu.getByRole('link', { name: 'Réalisations' }).click();
  await expect(page).toHaveURL(/\/realisations$/, { timeout: 15_000 });
  await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute('open', '');
  await context.close();
});

test.describe('scene 00 Formation', () => {
  test('states what and for whom in the first screen (FR)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const scene = page.locator('[data-dna-scene="formation"]');
    await expect(scene.getByRole('heading', { level: 1 })).toHaveText('L’ingénierie est dans l’ADN.');
    const lede = scene.getByText(/Je conçois et je livre des produits numériques/);
    await expect(lede).toBeInViewport();
    await expect(scene.getByRole('link', { name: 'Parler d’un projet' })).toHaveAttribute('href', '/brief');
    await expect(scene.getByRole('link', { name: 'Voir les réalisations' })).toHaveAttribute('href', '/realisations');
    await expect(scene.locator('[data-dna-stage]')).toBeAttached();
  });

  test('English hero', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Engineering is in the DNA.');
    await expect(page.locator('[data-dna-scene="formation"]').getByRole('link', { name: 'Discuss a project' })).toHaveAttribute('href', '/en/brief');
  });

  test('works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/Je conçois et je livre/)).toBeVisible();
    await expect(page.locator('img[data-dna-poster]')).toBeVisible();
    await context.close();
  });

  test('reads well at 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    // The stage sits behind the text, faded.
    const opacity = await page.locator('[data-dna-stage]').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBeLessThanOrEqual(0.5);
  });
});
