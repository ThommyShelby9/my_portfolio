import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const EXPLORATIONS = ['beninbouge', 'lecentre', 'najaexperts', 'procom'];

/** Unique case-study links in <main>, as slugs. */
async function caseSlugs(page: Page, prefix: string): Promise<string[]> {
  const hrefs = await page.locator(`main a[href^="${prefix}"]`).evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  return [...new Set(hrefs.map((h) => h.slice(prefix.length)).filter((s) => /^[a-z0-9-]+$/.test(s)))];
}

test.describe('work pages', () => {
  test('/realisations lists the 17 realisations (3 featured rows, then cards) and no exploration', async ({ page }) => {
    await page.goto('/realisations');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Des produits livrés, du premier schéma à la production.');
    await expect(page.getByRole('link', { name: /^Voir l’étude de cas : / })).toHaveCount(3);
    await expect(page.locator('[data-work-card]')).toHaveCount(14);
    const slugs = await caseSlugs(page, '/realisations/');
    expect(slugs).toHaveLength(17);
    for (const s of EXPLORATIONS) expect(slugs).not.toContain(s);
    await expect(page.locator('main a[href^="/explorations/"]')).toHaveCount(0);
    await expect(page.locator('main [data-exploration-badge]')).toHaveCount(0);
  });

  test('each featured case link opens its case page with the project as h1', async ({ page }) => {
    await page.goto('/realisations');
    const ctas = page.getByRole('link', { name: /^Voir l’étude de cas : / });
    const targets = await ctas.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href') ?? '', name: (el.getAttribute('aria-label') ?? '').replace('Voir l’étude de cas : ', '') })),
    );
    expect(targets.map((t) => t.name)).toEqual(['Ubbfy', 'ContractIQ', 'ZenLife']);
    for (const { href, name } of targets) {
      await page.goto(href);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    }
  });

  test('home case links and header links resolve', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.locator('#realisations-accueil a[href^="/realisations/"]').evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs).toHaveLength(3);
    for (const href of hrefs) expect((await request.get(href!)).status(), href!).toBe(200);
    for (const href of ['/realisations', '/explorations', '/en/work', '/en/explorations']) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });

  test('/en/work/contractiq credits the co-author', async ({ page }) => {
    await page.goto('/en/work/contractiq');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const facts = page.locator('main dl');
    await expect(facts.getByText('Co-built with')).toBeVisible();
    await expect(facts.getByText('Jérémie Zitti')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rostelmissimawu.com/en/work/contractiq');
  });

  test('a case page carries CreativeWork JSON-LD and its own share image', async ({ page, request }) => {
    await page.goto('/realisations/contractiq');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');
    expect(data).toMatchObject({
      '@type': 'CreativeWork',
      name: 'ContractIQ, étude de cas · Rostel Panoumassi',
      about: {
        '@type': 'CreativeWork',
        name: 'ContractIQ',
        dateCreated: '2026',
        creator: [
          { '@type': 'Person', '@id': 'https://rostelmissimawu.com/#person', name: 'Rostel Panoumassi' },
          { '@type': 'Person', name: 'Jérémie Zitti' },
        ],
      },
      url: 'https://rostelmissimawu.com/realisations/contractiq',
      author: { '@type': 'Person', '@id': 'https://rostelmissimawu.com/#person', name: 'Rostel Panoumassi' },
    });
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toContain('/realisations/contractiq/opengraph-image');
    const res = await request.get(new URL(og!).pathname + new URL(og!).search);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
  });

  test('the locale switch keeps a deep page: FR to EN and back', async ({ page }) => {
    await page.goto('/realisations/ubbfy');
    await page.locator('header a[hreflang="en"]').click();
    await expect(page).toHaveURL(/\/en\/work\/ubbfy$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('header a[hreflang="fr"]').click();
    // A 307 through /fr/... is acceptable: the final URL is the unprefixed FR one.
    await expect(page).toHaveURL(/\/realisations\/ubbfy$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('/realisations/zenlife shows its sourced proof', async ({ page }) => {
    await page.goto('/realisations/zenlife');
    await expect(page.locator('[data-proofs]')).toContainText('1 200+');
    await expect(page.locator('[data-proofs]')).toContainText('utilisateurs actifs en six mois');
  });

  test('a project without captures has no cover and no gallery', async ({ page }) => {
    await page.goto('/realisations/kaba');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kaba');
    await expect(page.locator('article[data-case] img')).toHaveCount(0);
    await expect(page.locator('#galerie')).toHaveCount(0);
  });

  test('gallery images have intrinsic dimensions and sizes', async ({ page }) => {
    await page.goto('/realisations/contractiq');
    const imgs = page.locator('section[aria-labelledby="galerie"] img');
    await expect(imgs).toHaveCount(7);
    for (const attrs of await imgs.evaluateAll((els) => els.map((el) => [el.getAttribute('width'), el.getAttribute('height'), el.getAttribute('sizes'), el.getAttribute('alt')]))) {
      expect(Number(attrs[0])).toBeGreaterThan(0);
      expect(Number(attrs[1])).toBeGreaterThan(0);
      expect(attrs[2]).toBeTruthy();
      expect(attrs[3]).toBeTruthy();
    }
  });

  test('/explorations shows the 4 studies, each labelled as a proposal', async ({ page }) => {
    await page.goto('/explorations');
    const cards = page.locator('[data-work-card]');
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(cards.nth(i).locator('[data-exploration-badge]')).toBeVisible();
    await expect(page.locator('[data-exploration-badge]', { hasText: 'Proposition de refonte non commandée' })).toHaveCount(3);
    await expect(page.locator('[data-exploration-badge]', { hasText: 'Proposition de refonte présentée au client' })).toHaveCount(1);
    expect((await caseSlugs(page, '/explorations/')).sort()).toEqual(EXPLORATIONS);
  });

  test('an exploration page shows its label above the title', async ({ page }) => {
    await page.goto('/en/explorations/beninbouge');
    const badge = page.locator('main [data-exploration-badge]');
    await expect(badge).toHaveText('Unsolicited redesign proposal');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText('Bénin Bouge');
    const [b, h] = await Promise.all([badge.boundingBox(), h1.boundingBox()]);
    expect(b!.y).toBeLessThan(h!.y);
  });

  for (const [path, text] of [
    ['/realisations/nope', 'Cette page n’existe pas.'],
    ['/en/work/nope', 'This page does not exist.'],
    ['/explorations/nope', 'Cette page n’existe pas.'],
  ]) {
    test(`${path} is a localized 404`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(404);
      expect(await res.text()).toContain(text);
    });
  }

  for (const path of ['/realisations', '/realisations/contractiq', '/explorations', '/explorations/najaexperts']) {
    test(`no accessibility violations on ${path}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('no horizontal overflow at 360 px', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await context.newPage();
    for (const path of ['/realisations', '/realisations/contractiq', '/realisations/it-opportunities-tracker', '/explorations', '/en/explorations/beninbouge']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
    await context.close();
  });

  test('gallery plates unmask on scroll and are shown at once under reduced motion', async ({ page }) => {
    await page.goto('/realisations/contractiq');
    const last = page.locator('section[aria-labelledby="galerie"] [data-reveal="mask"]').last();
    expect(await last.evaluate((el) => getComputedStyle(el).clipPath)).not.toBe('none');
    await last.scrollIntoViewIfNeeded();
    await expect.poll(() => last.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 10_000 }).toMatch(/^(none|inset\(0px\))$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/realisations/contractiq');
    const again = page.locator('section[aria-labelledby="galerie"] [data-reveal="mask"]').last();
    expect(await again.evaluate((el) => getComputedStyle(el).clipPath)).toBe('none');
  });
});
