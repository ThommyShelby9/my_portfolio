import { expect, test, type Page } from '@playwright/test';
import { OWNER } from '../../src/lib/site';
import { getDoc, statsDay, submissionsWith, uniqueToken } from './helpers/emulator';

// Full delivery path: the app server writes to the Firestore emulator (playwright.config.ts), never to
// the real project, and sends no email. Both projects run these tests in parallel against the same
// emulator, so every test tags its input with a unique token and only looks at its own documents.

/** A client IP of its own for each test: the in-memory rate limiter allows 5 deliveries per hour per IP. */
const ownIp = () => `10.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/** Required answers of the brief, the pitch carrying the token. */
async function fillBriefRequired(page: Page, pitch: string) {
  await page.locator('label:has(#brief-projectType-0)').click();
  await page.fill('#brief-pitch', pitch);
  await page.locator('label:has(#brief-currentState-0)').click();
  await page.locator('label:has(#brief-teamSize-0)').click();
  await page.locator('label:has(#brief-deadline-3)').click();
  await page.fill('#brief-firstName', 'Ada');
  await page.fill('#brief-lastName', 'Lovelace');
  await page.fill('#brief-email', 'ada@example.com');
}

async function fillContact(page: Page, name: string, message = 'Une question sur un produit existant.') {
  await page.fill('#contact-name', name);
  await page.fill('#contact-email', 'ada@example.com');
  await page.fill('#contact-message', message);
}

test.describe('forms on the Firestore emulator', () => {
  test('brief with JS: every step filled, a pitch at its limit with line breaks, stored once', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-real-ip': ownIp() });
    const token = uniqueToken('brief');
    // 1000 characters as the textarea counts them (LF), more once the browser submits CRLF.
    const head = `${token}\nA payment platform for small merchants.\nThey sell on social networks.\n`;
    const pitch = head + 'x'.repeat(1000 - head.length);
    expect(pitch).toHaveLength(1000);

    await page.goto('/brief');
    await page.locator('label:has(#brief-projectType-1)').click();
    await page.fill('#brief-pitch', pitch);
    await page.locator('label:has(#brief-currentState-3)').click();
    await page.locator('label:has(#brief-teamSize-1)').click();
    await page.locator('label:has(#brief-resources-0)').click();
    await page.locator('label:has(#brief-resources-2)').click();
    await page.fill('#brief-notes', 'Next.js front,\nLaravel API.');
    await page.locator('label:has(#brief-deadline-1)').click();
    await page.locator('label:has(#brief-budget-1)').click();
    await page.fill('#brief-firstName', 'Ada');
    await page.fill('#brief-lastName', 'Lovelace');
    await page.fill('#brief-email', 'ada@example.com');
    await page.fill('#brief-company', 'Analytical Engines');
    await page.fill('#brief-website', 'https://example.com');
    await page.fill('#brief-source', 'LinkedIn');
    await page.locator('label:has(#brief-prefersCall-0)').click();
    await page.getByRole('button', { name: 'Envoyer le brief' }).click();

    await expect(page).toHaveURL(/\/brief\/merci$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merci, votre brief est bien arrivé.');
    const docs = await submissionsWith(token);
    expect(docs).toHaveLength(1);
    const { type, locale, payload, createdAt, expireAt, ...rest } = docs[0].data;
    expect({ type, locale }).toEqual({ type: 'brief', locale: 'fr' });
    expect(typeof createdAt).toBe('string');
    // Retention: the TTL field is 24 months after the creation (the server clock, within a minute).
    const created = new Date(createdAt as string);
    const expected = new Date(created);
    expected.setUTCMonth(expected.getUTCMonth() + 24);
    expect(Math.abs(new Date(expireAt as string).getTime() - expected.getTime())).toBeLessThan(60_000);
    expect(rest).toEqual({}); // no IP, no user agent
    expect(payload).toEqual({
      projectType: 'revamp',
      pitch,
      currentState: 'mvpInProd',
      teamSize: '2-5',
      hasTechTeam: true,
      hasDesigner: false,
      hasProductOwner: true,
      notes: 'Next.js front,\nLaravel API.',
      deadline: '1-3m',
      budget: '5-15k',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      company: 'Analytical Engines',
      website: 'https://example.com',
      source: 'LinkedIn',
      prefersCall: true,
    });
  });

  test('contact in French with JS lands on /contact/merci and is stored', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-real-ip': ownIp() });
    const token = uniqueToken('contactfr');
    await page.goto('/contact');
    await fillContact(page, `Ada ${token}`);
    await page.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page).toHaveURL(/\/contact\/merci$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merci, votre message est bien arrivé.');
    const docs = await submissionsWith(token);
    expect(docs.map((d) => [d.data.type, d.data.locale])).toEqual([['contact', 'fr']]);
    expect(docs[0].data.payload).toEqual({ name: `Ada ${token}`, email: 'ada@example.com', message: 'Une question sur un produit existant.' });
  });

  test('the sixth delivery from one connection is rate limited, with the direct address and the answers kept', async ({ page, browser, baseURL }) => {
    const ip = ownIp();
    await page.setExtraHTTPHeaders({ 'x-real-ip': ip });
    const token = uniqueToken('limit');
    for (let i = 0; i < 5; i++) {
      await page.goto('/en/contact');
      await fillContact(page, `Ada ${token} ${i}`, 'A question about an existing product.');
      await page.getByRole('button', { name: 'Send the message' }).click();
      await expect(page).toHaveURL(/\/en\/contact\/thanks$/);
    }
    expect(await submissionsWith(token)).toHaveLength(5);

    await page.goto('/en/contact');
    await fillContact(page, `Ada ${token} 5`, 'A question about an existing product.');
    await page.getByRole('button', { name: 'Send the message' }).click();
    const notice = page.locator('[aria-live="polite"] > div');
    await expect(notice).toContainText('Try again in an hour');
    await expect(notice).toBeFocused();
    await expect(notice.getByRole('link', { name: OWNER.email })).toHaveAttribute('href', `mailto:${OWNER.email}`);
    await expect(page.locator('#contact-name')).toHaveValue(`Ada ${token} 5`);

    // Without JS the server renders the same notice and autofocus moves focus to it.
    const noJs = await browser.newContext({ baseURL, javaScriptEnabled: false, extraHTTPHeaders: { 'x-real-ip': ip } });
    const plain = await noJs.newPage();
    await plain.goto('/contact');
    await fillContact(plain, `Ada ${token} 6`);
    await plain.getByRole('button', { name: 'Envoyer le message' }).click();
    const plainNotice = plain.locator('[aria-live="polite"] > div');
    await expect(plainNotice).toContainText('Réessayez dans une heure');
    await expect(plainNotice.getByRole('link', { name: OWNER.email })).toHaveAttribute('href', `mailto:${OWNER.email}`);
    await expect(plainNotice).toBeFocused();
    await expect(plain.locator('#contact-name')).toHaveValue(`Ada ${token} 6`);
    await noJs.close();
    expect(await submissionsWith(token)).toHaveLength(5);
  });

  test('/api/hit counts known pages under their path and anything else under other', async ({ browser, baseURL }, testInfo) => {
    // isBot() drops HeadlessChrome: this context looks like a regular desktop browser. Its own IP keeps
    // the per-IP throttle (60 hits a minute) apart from the page views of the rest of the suite.
    const context = await browser.newContext({ userAgent: DESKTOP_UA, baseURL, extraHTTPHeaders: { 'x-real-ip': ownIp() } });
    const page = await context.newPage();
    const day = statsDay();
    type Stats = { total?: number; paths?: Record<string, number>; refs?: Record<string, number> };
    const read = async () => ((await getDoc(`stats_daily/${day}`))?.data ?? {}) as Stats;
    const unknown = `/e2e-${testInfo.project.name}-${uniqueToken('hit')}`;
    const before = await read();

    await page.goto('/');
    await page.evaluate(async (paths) => {
      for (const p of paths) {
        await fetch('/api/hit', { method: 'POST', body: JSON.stringify({ path: p, ref: 'https://www.google.com/search' }) });
      }
    }, ['/en/terms/', unknown]);

    // A known page keeps its own key (the trailing slash is ignored); an unknown one goes to `other`.
    await expect.poll(async () => (await read()).paths?.['~en~terms'] ?? 0).toBeGreaterThan(before.paths?.['~en~terms'] ?? 0);
    await expect.poll(async () => (await read()).paths?.other ?? 0).toBeGreaterThan(before.paths?.other ?? 0);
    const stats = await read();
    expect(stats.paths?.[unknown.replace(/\//g, '~')]).toBeUndefined();
    expect(stats.total ?? 0).toBeGreaterThan(before.total ?? 0);
    expect(stats.refs?.google_com ?? 0).toBeGreaterThanOrEqual(1);
    // The beacon mounted in the layout counted the home page too.
    await expect.poll(async () => (await read()).paths?.['~'] ?? 0).toBeGreaterThanOrEqual(1);
    await context.close();
  });
});

test.describe('forms on the Firestore emulator, without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('brief: invalid answers come back with the values, then a valid brief lands on the thank-you page', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-real-ip': ownIp() });
    const token = uniqueToken('briefnojs');
    await page.goto('/en/brief');
    await page.fill('#brief-pitch', `${token} short`);
    await page.fill('#brief-firstName', 'Ada');
    await page.locator('label:has(#brief-deadline-1)').click();
    await page.getByRole('button', { name: 'Send the brief' }).click();
    await expect(page.locator('#error-summary-title')).toBeVisible();
    await expect(page.locator('#brief-projectType-error')).toBeVisible();
    await expect(page.locator('#brief-pitch')).toHaveValue(`${token} short`);
    await expect(page.locator('#brief-firstName')).toHaveValue('Ada');
    await expect(page.locator('#brief-deadline-1')).toBeChecked();
    expect(await submissionsWith(token)).toHaveLength(0);

    await fillBriefRequired(page, `${token}: a payment platform for small merchants.`);
    await page.getByRole('button', { name: 'Send the brief' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you, your brief arrived.');
    expect(new URL(page.url()).pathname).toBe('/en/brief/thanks');
    const docs = await submissionsWith(token);
    expect(docs.map((d) => [d.data.type, d.data.locale])).toEqual([['brief', 'en']]);
    expect((docs[0].data.payload as { pitch: string }).pitch).toBe(`${token}: a payment platform for small merchants.`);
  });

  test('contact in English lands on /en/contact/thanks and is stored', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-real-ip': ownIp() });
    const token = uniqueToken('contacten');
    await page.goto('/en/contact');
    await fillContact(page, `Ada ${token}`, 'A question about an existing product.');
    await page.getByRole('button', { name: 'Send the message' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you, your message arrived.');
    expect(new URL(page.url()).pathname).toBe('/en/contact/thanks');
    const docs = await submissionsWith(token);
    expect(docs.map((d) => [d.data.type, d.data.locale])).toEqual([['contact', 'en']]);
  });

  for (const form of ['brief', 'contact'] as const) {
    test(`${form}: a filled honeypot lands on the thank-you page and stores nothing`, async ({ page }) => {
      await page.setExtraHTTPHeaders({ 'x-real-ip': ownIp() });
      const token = uniqueToken(`${form}trap`);
      await page.goto(`/${form}`);
      if (form === 'brief') await fillBriefRequired(page, `${token}: a payment platform for small merchants.`);
      else await fillContact(page, `Ada ${token}`);
      await page.locator('input[name=hp_extra]').evaluate((el: HTMLInputElement) => { el.value = 'bot'; });
      await page.locator(`#${form}-form button[type=submit]`).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        form === 'brief' ? 'Merci, votre brief est bien arrivé.' : 'Merci, votre message est bien arrivé.',
      );
      expect(new URL(page.url()).pathname).toBe(`/${form}/merci`);
      expect(await submissionsWith(token)).toHaveLength(0);
    });
  }
});
