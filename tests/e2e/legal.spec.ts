import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGES = [
  ['/confidentialite', 'fr'],
  ['/cgu', 'fr'],
  ['/en/privacy', 'en'],
  ['/en/terms', 'en'],
] as const;

test.describe('legal pages', () => {
  for (const [path] of PAGES) {
    test(`no accessibility violations on ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });
  }

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const [path] of PAGES) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('the footer links to both pages in each language', async ({ page }) => {
    for (const [home, privacy, terms] of [
      ['/', '/confidentialite', '/cgu'],
      ['/en', '/en/privacy', '/en/terms'],
    ]) {
      await page.goto(home);
      const footer = page.getByRole('contentinfo');
      await expect(footer.locator(`a[href="${privacy}"]`)).toHaveCount(1);
      await expect(footer.locator(`a[href="${terms}"]`)).toHaveCount(1);
    }
  });

  test('the privacy page states no cookies, the retention period and Cloudflare, without an em dash', async ({ request }) => {
    for (const [path, words] of [
      ['/confidentialite', ['cookie', '24 mois', 'Cloudflare, Inc.']],
      ['/en/privacy', ['cookie', '24 months', 'Cloudflare, Inc.']],
    ] as const) {
      const html = await (await request.get(path)).text();
      for (const w of words) expect(html, `${path} ${w}`).toContain(w);
      expect(html, path).not.toContain('—');
    }
  });
});
