import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGES = [
  { path: '/a-propos', h1: 'Ingénieur produit, tech lead, formateur.', sections: ['01 · Parcours', '02 · Comment je travaille', '03 · Ce que je maîtrise', '04 · Formation'], other: /Parcours|Formation|aujourd’hui/ },
  { path: '/en/about', h1: 'Product engineer, tech lead, trainer.', sections: ['01 · Career', '02 · How I work', '03 · What I work with', '04 · Education'], other: /Career|Education|present/ },
] as const;

test.describe('about page', () => {
  for (const { path, h1, sections } of PAGES) {
    test(`${path} renders the hero, the portrait and every section`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
      const portrait = page.locator('img[data-portrait]');
      await expect(portrait).toBeVisible();
      await expect(portrait).toHaveAttribute('alt', /^Rostel Panoumassi, portrait/);
      expect(await portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0 && img.naturalWidth <= 654)).toBe(true);
      for (const kicker of sections) await expect(page.getByText(kicker, { exact: true })).toBeVisible();
      await expect(page.locator('#parcours + ol > li')).toHaveCount(6);
      await expect(page.locator('#formation + ol > li')).toHaveCount(4);
      await expect(page.locator('#projet')).toBeVisible();
      expect(await page.content()).not.toContain('—');
    });

    test(`no accessibility violations on ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });
  }

  test('each language has its own canonical and a ProfilePage about the site Person', async ({ request }) => {
    for (const { path } of PAGES) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/.exec(html)?.[1] ?? /<link[^>]*href="([^"]+)"[^>]*rel="canonical"/.exec(html)?.[1];
      expect(new URL(canonical ?? 'about:blank').pathname, path).toBe(path);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
      const nodes = blocks.flatMap((b) => b['@graph'] ?? [b]);
      const profile = nodes.find((n) => n['@type'] === 'ProfilePage');
      const person = nodes.find((n) => n['@type'] === 'Person');
      expect(profile.mainEntity['@id']).toBe(person['@id']);
      expect(person['@id']).toMatch(/\/#person$/);
    }
  });

  test('English page shows no French copy', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.locator('main')).not.toContainText(PAGES[0].other);
  });

  test('the header links to the page in each language', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation');
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'À propos' }).click();
    await expect(page).toHaveURL(/\/a-propos$/);
    await page.goto('/en');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/en\/about$/);
  });

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const { path } of PAGES) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
