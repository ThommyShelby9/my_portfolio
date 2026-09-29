import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home sequences', () => {
  test('French home shows the four sequences in order', async ({ page }) => {
    await page.goto('/');
    const headings = page.getByRole('heading', { level: 2 });
    await expect(headings.nth(0)).toContainText('Je ne livre pas du code');
    await expect(headings.nth(1)).toContainText('Trois produits');
    await expect(headings.nth(2)).toContainText('De l’idée à la production');
    await expect(headings.nth(3)).toContainText('Parlons de votre projet');
    await expect(page.locator('#realisations-accueil').getByText('Co-développé avec')).toBeVisible();
    await expect(page.locator('#projet').getByText(/sous 48 heures/)).toBeVisible();
    await expect(page.getByText(/des produits livrés, pas des maquettes/)).toBeVisible();
  });

  test('English home is fully translated', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /ship products that hold up/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Three products/ })).toBeVisible();
    await expect(page.locator('#realisations-accueil').getByText('Co-built with')).toBeVisible();
    await expect(page.locator('#projet').getByText(/within 48 hours/)).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/Parlons de votre projet|Réalisations|sous 48 heures|Co-développé/);
  });

  test('below-fold text appears when scrolled into view', async ({ page }) => {
    await page.goto('/');
    const conv = page.getByRole('heading', { name: 'Parlons de votre projet.' });
    await conv.scrollIntoViewIfNeeded();
    await expect.poll(async () => conv.evaluate((el) => getComputedStyle(el).opacity), { timeout: 15_000 }).toBe('1');
  });

  test('below-fold text is visible even when page scripts never load', async ({ page }) => {
    await page.route('**/_next/static/chunks/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3000);
    const conv = page.getByRole('heading', { name: 'Parlons de votre projet.' });
    await conv.scrollIntoViewIfNeeded();
    expect(await conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  test('reduced motion: everything visible at once, still ring at Conversion, stage not fixed', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const conv = page.getByRole('heading', { name: 'Parlons de votre projet.' });
    expect(await conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('[data-conversion-poster]')).toBeVisible();
    if (!isMobile) {
      expect(await page.locator('[data-sculpture-stage]').evaluate((el) => getComputedStyle(el).position)).not.toBe('fixed');
    }
  });

  test('live sculpture fades at Work and returns at Conversion (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop trajectory');
    test.setTimeout(60_000);
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await page.getByRole('heading', { name: /Trois produits/ }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await expect(stage).toHaveAttribute('data-running', 'false', { timeout: 5000 });
    await page.getByRole('heading', { name: 'Parlons de votre projet.' }).scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-running', 'true', { timeout: 5000 });
    await expect(page.locator('[data-conversion-poster]')).toBeHidden();
  });

  test('ring returns to full opacity when scrolling back to the top (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop trajectory');
    test.setTimeout(60_000);
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await page.getByRole('heading', { name: 'Parlons de votre projet.' }).scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-running', 'true', { timeout: 5000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    await expect.poll(async () => stage.evaluate((el) => getComputedStyle(el).opacity), { timeout: 10_000 }).toBe('1');
    await expect(stage).toHaveAttribute('data-running', 'true', { timeout: 5000 });
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
  await menu.getByRole('link', { name: 'Expertise' }).click();
  await expect(menu).not.toHaveAttribute('open', '');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await menu.getByRole('link', { name: 'Réalisations' }).click();
  await expect(page).toHaveURL(/\/realisations$/, { timeout: 15_000 });
  await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute('open', '');
  await context.close();
});
