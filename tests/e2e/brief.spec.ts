import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Page, accessibility and validation checks for the brief. Submissions that reach delivery
// (stored documents, honeypot, rate limit) are covered by forms.spec.ts on the Firestore emulator.

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** The sticky header must not cover the label of the field a summary link leads to. */
async function expectFieldInView(page: Page, name: string) {
  const header = await page.locator('header').first().boundingBox();
  const label = await page.locator(`#brief-${name}-field`).locator('label, legend').first().boundingBox();
  const error = await page.locator(`#brief-${name}-error`).boundingBox();
  const viewport = page.viewportSize()!;
  expect(label!.y, 'label below the header').toBeGreaterThanOrEqual(header!.y + header!.height);
  expect(error!.y + error!.height, 'error inside the viewport').toBeLessThanOrEqual(viewport.height);
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

  test('a summary link lands with the label, hint and error under the header, and focuses the control', async ({ page }) => {
    await page.goto('/brief');
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();
    const summary = page.getByRole('group', { name: 'Quelques réponses sont à revoir.' });
    await expect(summary).toBeFocused();
    for (const [link, name, control] of [
      ['Adresse e-mail', 'email', '#brief-email'],
      ['Votre projet en quelques lignes', 'pitch', '#brief-pitch'],
      ['Échéance souhaitée', 'deadline', '#brief-deadline-0'],
    ] as const) {
      await summary.getByRole('link', { name: link }).click();
      await expect(page.locator(control)).toBeFocused();
      await expectFieldInView(page, name);
      await summary.scrollIntoViewIfNeeded();
    }
  });

  test('an error with no field to link to still gets a summary line and the focus', async ({ page }) => {
    const generic = 'Une réponse n’a pas pu être prise en compte. Vérifiez le formulaire, puis renvoyez-le.';
    await page.goto('/brief');
    // Every field valid, only the hidden locale tampered with: nothing to link to.
    await page.locator('label:has(#brief-projectType-0)').click();
    await page.fill('#brief-pitch', 'A payment platform for small merchants.');
    await page.locator('label:has(#brief-currentState-0)').click();
    await page.locator('label:has(#brief-teamSize-0)').click();
    await page.locator('label:has(#brief-deadline-3)').click();
    await page.fill('#brief-firstName', 'Ada');
    await page.fill('#brief-lastName', 'Lovelace');
    await page.fill('#brief-email', 'ada@example.com');
    await page.locator('input[name=locale]').evaluate((el: HTMLInputElement) => { el.value = 'de'; });
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();
    const summary = page.getByRole('group', { name: 'Quelques réponses sont à revoir.' });
    await expect(summary).toBeFocused();
    await expect(summary.locator('p')).toHaveText(generic);
    await expect(summary.getByRole('list')).toHaveCount(0);

    // Next to linked errors, the generic line closes the list.
    await page.fill('#brief-email', 'nope');
    await page.locator('input[name=locale]').evaluate((el: HTMLInputElement) => { el.value = 'de'; });
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();
    await expect(summary.getByRole('listitem')).toHaveCount(2);
    await expect(summary.getByRole('listitem').last()).toHaveText(generic);
  });

  test('controls are rectangular and every chip has a visible label', async ({ page }) => {
    await page.goto('/brief');
    const radii = await page.locator('input:not([type=hidden]):not([name=hp_extra]), textarea, label > span, button[type=submit]')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)));
    expect(radii.length).toBeGreaterThan(20);
    for (const r of radii) expect(r).toBeLessThanOrEqual(2);
    await expect(page.getByText('Une mission ponctuelle')).toBeVisible();
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

  test('the server-rendered summary takes the focus, and its links land on the whole field', async ({ page }) => {
    await page.goto('/brief');
    await page.fill('#brief-pitch', 'short');
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();
    const summary = page.getByRole('group', { name: 'Quelques réponses sont à revoir.' });
    await expect(summary).toBeFocused();
    await summary.getByRole('link', { name: 'Adresse e-mail' }).click();
    await expect(page).toHaveURL(/#brief-email-field$/);
    await expectFieldInView(page, 'email');
    await page.keyboard.press('Tab');
    await expect(page.locator('#brief-email')).toBeFocused();
  });
});
