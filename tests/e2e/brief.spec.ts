import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Light checks for the brief page. The full delivery path (Firestore emulator, stored documents)
// is covered by forms.spec.ts. Here the server has no Firebase and no SMTP env, so a valid
// submission always ends in the "failed" state, which is what the last test asserts.

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function fillValid(page: Page) {
  await page.locator('label:has(#brief-projectType-0)').click();
  await page.fill('#brief-pitch', 'A payment platform for small merchants.');
  await page.locator('label:has(#brief-currentState-0)').click();
  await page.locator('label:has(#brief-teamSize-0)').click();
  await page.locator('label:has(#brief-deadline-3)').click();
  await page.fill('#brief-firstName', 'Ada');
  await page.fill('#brief-lastName', 'Lovelace');
  await page.fill('#brief-email', 'ada@example.com');
}

test.describe('brief', () => {
  for (const path of ['/brief', '/en/brief']) {
    test(`no accessibility violations on ${path}, empty and with errors`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
      await page.getByRole('button', { name: /brief/i }).click();
      await expect(page.locator('#error-summary-title')).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });
  }

  test('with JS, errors focus the summary, bind to their fields and keep the answers', async ({ page }) => {
    await page.goto('/brief');
    await page.locator('label:has(#brief-projectType-2)').click();
    await page.fill('#brief-pitch', 'short');
    await page.fill('#brief-email', 'nope');
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();
    const summary = page.getByRole('group', { name: 'Quelques réponses sont à revoir.' });
    await expect(summary).toBeFocused();
    await expect(page.locator('#brief-pitch')).toHaveAttribute('aria-describedby', /brief-pitch-error/);
    await expect(page.locator('#brief-pitch-error')).toContainText('au moins 10 caractères');
    await expect(page.locator('#brief-pitch')).toHaveValue('short');
    await expect(page.locator('#brief-projectType-2')).toBeChecked();
    await summary.getByRole('link', { name: 'Adresse e-mail' }).click();
    await expect(page.locator('#brief-email')).toBeFocused();
  });

  test('controls are rectangular and every chip has a visible label', async ({ page }) => {
    await page.goto('/brief');
    const radii = await page.locator('input:not([type=hidden]):not([name=nickname]), textarea, label > span, button[type=submit]')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)));
    expect(radii.length).toBeGreaterThan(20);
    for (const r of radii) expect(r).toBeLessThanOrEqual(2);
    await expect(page.getByText('Une mission ponctuelle')).toBeVisible();
  });

  test('a delivery failure shows the direct email in a live region and keeps the answers', async ({ page }) => {
    await page.goto('/en/brief');
    await fillValid(page);
    await page.getByRole('button', { name: 'Send the brief' }).click();
    const notice = page.locator('[aria-live="polite"]');
    await expect(notice).toContainText('could not be sent');
    await expect(notice.getByRole('link', { name: 'rmissimawu@gmail.com' })).toHaveAttribute('href', 'mailto:rmissimawu@gmail.com');
    await expect(page.locator('#brief-pitch')).toHaveValue('A payment platform for small merchants.');
  });

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/brief', '/en/brief/thanks']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('thank-you pages are localized and noindex', async ({ request }) => {
    for (const [path, title] of [
      ['/brief/merci', 'Merci, votre brief est bien arrivé.'],
      ['/en/brief/thanks', 'Thank you, your brief arrived.'],
    ]) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain(title);
      expect(html, path).toMatch(/<meta name="robots" content="noindex"/);
    }
  });
});

test.describe('brief without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('invalid answers come back with errors and the values kept', async ({ page }) => {
    await page.goto('/brief');
    await page.fill('#brief-pitch', 'short');
    await page.fill('#brief-firstName', 'Ada');
    await page.locator('label:has(#brief-deadline-1)').click();
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();
    await expect(page.locator('#error-summary-title')).toBeVisible();
    await expect(page.locator('#brief-pitch')).toHaveValue('short');
    await expect(page.locator('#brief-firstName')).toHaveValue('Ada');
    await expect(page.locator('#brief-deadline-1')).toBeChecked();
  });

  test('a filled honeypot lands on the thank-you page without delivering', async ({ page }) => {
    await page.goto('/en/brief');
    await fillValid(page);
    await page.locator('input[name=nickname]').evaluate((el: HTMLInputElement) => { el.value = 'bot'; });
    await page.getByRole('button', { name: 'Send the brief' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you, your brief arrived.');
    expect(new URL(page.url()).pathname).toBe('/en/brief/thanks');
  });
});
