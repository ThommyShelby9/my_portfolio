import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('foundations', () => {
  test('French home is the default and states what, for whom', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('SaaS, de paiement et de gestion');
    await expect(page.getByText(/Six ans d’expérience, dont trois comme tech lead/)).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/);
    expect(errors).toEqual([]);
  });

  test('English home lives under /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('SaaS, payment and management');
  });

  test('locale switch goes to the same page in the other language and back', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[hreflang="en"]').first().click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('a[hreflang="fr"]').first().click();
    // /fr answers a 307 to /; allow for it while other workers load the machine.
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr', { timeout: 15000 });
  });

  test('an English browser opening / stays on the French home', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['set-cookie']).toBeUndefined();
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await context.close();
  });

  test('the English home sets no cookie', async ({ request }) => {
    const res = await request.get('/en');
    expect(res.status()).toBe(200);
    expect(res.headers()['set-cookie']).toBeUndefined();
  });

  test('unknown paths return the localized 404', async ({ request }) => {
    for (const path of ['/de', '/xx/whatever']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
      expect(await res.text(), path).toContain('Cette page n’existe pas.');
    }
  });

  test('buttons keep a square 2 px radius', async ({ page }) => {
    for (const path of ['/', '/en']) {
      await page.goto(path);
      const radii = await page.locator('[data-button]').evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).borderTopLeftRadius),
      );
      expect(radii.length, path).toBeGreaterThan(0);
      for (const r of radii) expect(parseFloat(r), path).toBeLessThanOrEqual(2);
    }
  });

  test('under reduced motion the hero title is visible and untransformed at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const style = await page.getByRole('heading', { level: 1 }).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, transform: cs.transform };
    });
    expect(style).toEqual({ opacity: '1', transform: 'none' });
  });

  test('favicons and manifest are served', async ({ request }) => {
    for (const path of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/site.webmanifest', '/sculpture/mobius-desktop.webp']) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test('health endpoint answers', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/', '/en']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('keyboard: skip link first, visible focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(skip).toBeFocused();
    expect(await skip.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  });

  test('hero text becomes visible even if the page scripts never load', async ({ page }) => {
    await page.route('**/_next/static/chunks/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3000);
    const opacity = await page.getByRole('heading', { level: 1 }).evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });

  for (const path of ['/', '/en']) {
    test(`no accessibility violations on ${path}`, async ({ page }) => {
      // Reduced motion gives a static page (no live WebGL, everything revealed), so axe is fast and stable.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('home is readable and shows the poster', async ({ page }) => {
    // domcontentloaded: the lazy work images go through the image optimizer, which can be slow while WebGL tests hog the CPU.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-sculpture-poster]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voir les réalisations' })).toBeVisible();
  });
});
