import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Page, accessibility and validation checks for the contact page. Submissions that reach delivery
// (stored documents, honeypot, rate limit) are covered by forms.spec.ts on the Firestore emulator.

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('contact', () => {
  for (const path of ['/contact', '/en/contact']) {
    test(`no accessibility violations on ${path}, empty and with errors`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
      await page.locator('#contact-form button[type=submit]').click();
      await expect(page.locator('#error-summary-title')).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });
  }

  test('states the direct channels and points to the brief', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Write directly.');
    await expect(page.getByRole('main').getByRole('link', { name: 'rmissimawu@gmail.com' })).toHaveAttribute('href', 'mailto:rmissimawu@gmail.com');
    await expect(page.getByRole('main').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com\/in\//);
    await expect(page.getByRole('main').getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/ThommyShelby9');
    await expect(page.getByText('Cotonou, Benin · UTC+1')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Describe my project' })).toHaveAttribute('href', '/en/brief');
  });

  test('with JS, errors focus the summary and keep the answers', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#contact-name', 'Ada Lovelace');
    await page.fill('#contact-message', 'Bonjour');
    await page.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page.getByRole('group', { name: 'Quelques réponses sont à revoir.' })).toBeFocused();
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-describedby', /contact-email-error/);
    await expect(page.locator('#contact-name')).toHaveValue('Ada Lovelace');
    await expect(page.locator('#contact-message')).toHaveValue('Bonjour');
  });

  test('the honeypot is hidden, out of the tab order and not an autofill target', async ({ page }) => {
    await page.goto('/contact');
    const trap = page.locator('input[name=hp_extra]');
    await expect(trap).toHaveAttribute('tabindex', '-1');
    await expect(trap).toHaveAttribute('autocomplete', 'off');
    await expect(page.locator('div[aria-hidden="true"]:has(input[name=hp_extra])')).toHaveCount(1);
    expect((await trap.boundingBox())!.x).toBeLessThan(-1000);
  });

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/contact', '/en/contact', '/contact/merci']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('thank-you pages are localized and noindex', async ({ request }) => {
    for (const [path, title] of [
      ['/contact/merci', 'Merci, votre message est bien arrivé.'],
      ['/en/contact/thanks', 'Thank you, your message arrived.'],
    ]) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain(title);
      expect(html, path).toMatch(/<meta name="robots" content="noindex"/);
    }
  });
});

test.describe('contact without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('invalid answers come back with errors and the values kept', async ({ page }) => {
    await page.goto('/en/contact');
    await page.fill('#contact-name', 'Ada');
    await page.fill('#contact-message', 'Hi');
    await page.getByRole('button', { name: 'Send the message' }).click();
    await expect(page.locator('#error-summary-title')).toBeVisible();
    await expect(page.locator('#contact-message-error')).toContainText('at least 10 characters');
    await expect(page.locator('#contact-name')).toHaveValue('Ada');
    await expect(page.locator('#contact-message')).toHaveValue('Hi');
    await expect(page.getByRole('group', { name: 'A few answers need another look.' })).toBeFocused();
  });
});
