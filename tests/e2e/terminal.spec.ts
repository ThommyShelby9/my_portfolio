import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGES = [
  { path: '/terminal', lang: 'fr', label: 'Commande du terminal', title: 'Le site, en ligne de commande.', back: 'Retour au site', home: '/', help: 'Commandes disponibles' },
  { path: '/en/terminal', lang: 'en', label: 'Terminal command', title: 'The site, from the command line.', back: 'Back to the site', home: '/en', help: 'Available commands:' },
] as const;

const prompt = (page: Page, label: string) => page.getByRole('textbox', { name: label });

async function type(page: Page, label: string, command: string) {
  const input = prompt(page, label);
  await input.fill(command);
  await input.press('Enter');
}

test.describe('terminal', () => {
  for (const { path, lang, label, title, back, home, help } of PAGES) {
    test(`${path} loads with the prompt focused and stays out of the index`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(prompt(page, label)).toBeFocused();
      await expect(page.getByRole('link', { name: back })).toHaveAttribute('href', home);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      expect(errors).toEqual([]);
    });

    test(`${path}: help lists the commands and the prompt keeps the focus`, async ({ page }) => {
      await page.goto(path);
      await type(page, label, 'help');
      const log = page.getByRole('log');
      await expect(log).toContainText(help);
      for (const command of ['whoami', 'open <slug>', 'explorations', 'lang fr|en', 'clear', 'exit']) await expect(log).toContainText(command);
      await expect(prompt(page, label)).toBeFocused();
      await expect(prompt(page, label)).toHaveValue('');
      await type(page, label, 'clear');
      await expect(log).toBeEmpty();
    });
  }

  test('ls, whoami and an unknown command answer in the page language', async ({ page }) => {
    await page.goto('/terminal');
    const log = page.getByRole('log');
    await type(page, 'Commande du terminal', 'ls');
    await expect(log).toContainText('ubbfy');
    await expect(log).toContainText('TadagbeRhPlus');
    await type(page, 'Commande du terminal', 'whoami');
    await expect(log).toContainText('Six ans d’expérience, dont trois comme tech lead');
    await type(page, 'Commande du terminal', 'foo');
    await expect(log).toContainText('commande introuvable : foo. Tapez help.');
  });

  test('open <slug> goes to the case study in both languages, and to an exploration', async ({ page }) => {
    await page.goto('/terminal');
    await type(page, 'Commande du terminal', 'open ubbfy');
    await expect(page).toHaveURL(/\/realisations\/ubbfy$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ubbfy');

    await page.goto('/en/terminal');
    await type(page, 'Terminal command', 'open ubbfy');
    await expect(page).toHaveURL(/\/en\/work\/ubbfy$/);

    await page.goto('/terminal');
    await type(page, 'Commande du terminal', 'open procom');
    await expect(page).toHaveURL(/\/explorations\/procom$/);
  });

  test('lang en switches to the English terminal and lang fr back', async ({ page }) => {
    await page.goto('/terminal');
    await type(page, 'Commande du terminal', 'lang en');
    await expect(page).toHaveURL(/\/en\/terminal$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(prompt(page, 'Terminal command')).toBeFocused();
    await type(page, 'Terminal command', 'lang fr');
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 15000 }).toBe('/terminal');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr', { timeout: 15000 });
  });

  test('Tab completes, the arrows walk the history, Escape changes nothing', async ({ page }) => {
    await page.goto('/terminal');
    const input = prompt(page, 'Commande du terminal');
    await input.pressSequentially('wh');
    await input.press('Tab');
    await expect(input).toHaveValue('whoami ');
    await expect(input).toBeFocused();
    await input.press('Enter');
    await type(page, 'Commande du terminal', 'ls');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('ls');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('whoami');
    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await expect(input).toHaveValue('');
    await input.pressSequentially('open ub');
    await input.press('Escape');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('open ub');
  });

  test('Tab never traps the focus', async ({ page }) => {
    await page.goto('/terminal');
    const input = prompt(page, 'Commande du terminal');
    await expect(input).toBeFocused();
    // Empty line: nothing to complete, Tab leaves the field.
    await input.press('Tab');
    await expect(input).not.toBeFocused();
    // Ambiguous word: the first Tab lists the options, the second one leaves.
    await input.focus();
    await input.pressSequentially('c');
    await input.press('Tab');
    await expect(page.getByRole('log')).toContainText('contact  cv  clear');
    await expect(input).toBeFocused();
    await input.press('Tab');
    await expect(input).not.toBeFocused();
  });

  test('cv opens the PDF of the page language', async ({ page }) => {
    for (const [path, label, pdf] of [
      ['/terminal', 'Commande du terminal', '/cv/rostel-panoumassi-cv.pdf'],
      ['/en/terminal', 'Terminal command', '/cv/rostel-panoumassi-cv-en.pdf'],
    ] as const) {
      await page.goto(path);
      const request = page.waitForRequest((r) => new URL(r.url()).pathname === pdf);
      await type(page, label, 'cv');
      await request;
    }
  });

  for (const { path } of PAGES) {
    test(`no accessibility violations on ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const label = path === '/terminal' ? 'Commande du terminal' : 'Terminal command';
      await type(page, label, 'help');
      await type(page, label, 'ls');
      await expect(page.getByRole('log')).toContainText('ubbfy');
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });
  }

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const { path, label } of PAGES) {
      await page.goto(path);
      for (const command of ['help', 'ls', 'explorations', 'whoami']) await type(page, label, command);
      await expect(page.getByRole('log')).toContainText('it-opportunities-tracker');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('terminal without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the same destinations as plain links', async ({ page }) => {
    for (const [path, links] of [
      ['/terminal', [['Réalisations', '/realisations'], ['Explorations', '/explorations'], ['Envoyer un brief', '/brief'], ['Contact', '/contact'], ['CV en PDF', '/cv/rostel-panoumassi-cv.pdf'], ['Accueil', '/']]],
      ['/en/terminal', [['Work', '/en/work'], ['Explorations', '/en/explorations'], ['Send a brief', '/en/brief'], ['Contact', '/en/contact'], ['CV as a PDF', '/cv/rostel-panoumassi-cv-en.pdf'], ['Home', '/en']]],
    ] as const) {
      await page.goto(path);
      const fallback = page.locator('main ul');
      for (const [name, href] of links) await expect(fallback.getByRole('link', { name, exact: true }), `${path} ${name}`).toHaveAttribute('href', href);
      await expect(page.getByRole('textbox')).toHaveCount(0);
      await expect(page.locator('#terminal-keys')).toBeHidden();
    }
  });
});
