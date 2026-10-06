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

  test('deep unknown paths get the styled, localized 404', async ({ page }) => {
    // /foo/bar/baz goes through the proxy; /foo/bar/baz.php and /api/nope skip it (dot, api) and reach
    // [locale]/[...rest] with an invalid locale, which the layout renders in French.
    for (const path of ['/foo/bar/baz', '/foo/bar/baz.php', '/api/nope']) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
      await expect(page.locator('html'), path).toHaveAttribute('lang', 'fr');
      await expect(page.getByRole('heading', { level: 1 }), path).toHaveText('Cette page n’existe pas.');
      // The site chrome and fonts, not the framework's bare page.
      await expect(page.getByRole('banner'), path).toBeVisible();
      expect(await page.getByRole('heading', { level: 1 }).evaluate((h) => getComputedStyle(h).fontFamily), path).toMatch(/Archivo/i);
      await expect(page.locator('main').getByRole('link', { name: 'Voir les réalisations' }), path).toHaveAttribute('href', '/realisations');
    }
  });

  test('a URL no route matches gets the styled, bilingual global 404', async ({ page }) => {
    // One segment that is not a locale and skips the proxy: no route at all (app/global-not-found.tsx).
    for (const path of ['/foo.php', '/wp-login.php']) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
      const main = page.locator('[data-global-not-found]');
      await expect(main, path).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas.');
      await expect(main.locator('[lang="en"]').getByText('This page does not exist.')).toBeVisible();
      await expect(main.getByRole('link', { name: 'Voir les réalisations' })).toHaveAttribute('href', '/realisations');
      await expect(main.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/en');
      expect(await page.getByRole('heading', { level: 1 }).evaluate((h) => getComputedStyle(h).fontFamily), path).toMatch(/Archivo/i);
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), path).toBe('rgb(18, 18, 17)');
      await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /favicon/);
      expect(await page.content(), path).not.toContain('—');
    }
  });

  test('the global 404 has no accessibility violations', async ({ page }) => {
    await page.goto('/foo.php');
    await expect(page.locator('[data-global-not-found]')).toBeVisible();
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations).toEqual([]);
  });

  test('security headers are sent with the home page', async ({ request }) => {
    for (const path of ['/', '/en']) {
      const headers = (await request.get(path)).headers();
      expect(headers['x-content-type-options'], path).toBe('nosniff');
      expect(headers['referrer-policy'], path).toBe('strict-origin-when-cross-origin');
      expect(headers['x-frame-options'], path).toBe('DENY');
      expect(headers['permissions-policy'], path).toBe('camera=(), microphone=(), geolocation=()');
      expect(headers['strict-transport-security'], path).toBe('max-age=31536000; includeSubDomains');
      // No CSP yet (follow-up: the inline early script needs a nonce or a hash first).
      expect(headers['content-security-policy'], path).toBeUndefined();
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
    expect(await res.json()).toEqual({ ok: true, emulator: true });
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

test('chrome uses the Instrument style', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const header = page.locator('header').first();
  await expect(header.locator('> div')).toHaveCSS('min-height', '88px');
  // Navigation menu items are IBM Plex Mono, uppercase (the monogram is a brand mark in Archivo).
  const link = header.getByRole('navigation').getByRole('link', { name: 'Réalisations' });
  await expect(link).toHaveCSS('text-transform', 'uppercase');
  expect(await link.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Plex Mono/i);
  // The primary call to action is an ivory rectangle.
  const cta = header.getByRole('link', { name: /parler d’un projet/i });
  await expect(cta).toHaveCSS('background-color', 'rgb(237, 234, 228)');
  expect(parseFloat(await cta.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))).toBeLessThanOrEqual(2);
});

test('language switch name contains its visible text (WCAG 2.5.3)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header').getByRole('link', { name: /^EN\b/ })).toBeVisible();
  await page.goto('/en');
  await expect(page.locator('header').getByRole('link', { name: /^FR\b/ })).toBeVisible();
});
