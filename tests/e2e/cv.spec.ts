import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGES = [
  {
    path: '/cv',
    home: '/',
    pdf: '/cv/rostel-panoumassi-cv.pdf',
    download: 'Télécharger le PDF',
    note: 'Postes documentés depuis 2023. Les années précédentes : projets et formation.',
    headings: ['Profil', 'Expérience', 'Projets choisis', 'Contact', 'Compétences', 'Formation'],
    metrics: ['−85 % de saisie manuelle', '3 mises à jour réglementaires CNSS sans aucune régression', '1 200+ utilisateurs actifs en six mois', '+240 % de trafic organique en six mois', 'Score SEO Lighthouse de 100'],
  },
  {
    path: '/en/cv',
    home: '/en',
    pdf: '/cv/rostel-panoumassi-cv-en.pdf',
    download: 'Download the PDF',
    note: 'Roles documented since 2023. The years before: projects and training.',
    headings: ['Profile', 'Experience', 'Selected projects', 'Contact', 'Skills', 'Education'],
    metrics: ['−85% manual data entry', '3 CNSS regulatory updates with no regressions', '1,200+ active users in six months', '+240% organic traffic in six months', 'Lighthouse SEO score of 100'],
  },
] as const;

test.describe('cv page', () => {
  for (const { path, pdf, download, note, headings, metrics } of PAGES) {
    test(`${path} renders the CV from the shared data`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rostel Panoumassi');
      for (const name of headings) await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
      await expect(page.locator('[aria-labelledby="cv-experience"] ol > li')).toHaveCount(6);
      await expect(page.locator('[aria-labelledby="cv-education"] ol > li')).toHaveCount(4);
      const projects = page.locator('[aria-labelledby="cv-projects"] ol > li');
      await expect(projects).toHaveCount(4);
      await expect(projects.locator('h3')).toHaveText(['Ubbfy', 'TadagbeRhPlus', 'ZenLife', 'CCNS Bénin']);
      // Owner-confirmed figures only; Ubbfy states none.
      await expect(page.locator('.cv-metrics li')).toHaveText([...metrics]);
      await expect(projects.first().locator('.cv-metrics')).toHaveCount(0);
      await expect(page.locator('[data-cv]').getByRole('link', { name: 'rmissimawu@gmail.com' })).toHaveAttribute('href', 'mailto:rmissimawu@gmail.com');
      const html = await page.content();
      expect(html).not.toContain('—');
      const link = page.getByRole('link', { name: download });
      await expect(link).toHaveAttribute('href', pdf);
      // The listed roles start in 2023: the note under Experience says why the six years are more.
      await expect(page.locator('.cv-career-note')).toHaveText(note);
      // The LinkedIn URL is one unbroken line.
      const linkedin = page.locator('[data-cv] a[href*="linkedin.com"]');
      await expect(linkedin).toHaveCSS('white-space', 'nowrap');
      // ProfilePage about the shared Person node, like the About page.
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}');
      const types = (ld['@graph'] as { '@type': string }[]).map((n) => n['@type']);
      expect(types).toEqual(['ProfilePage', 'Person']);
    });

    test(`${path} links to its PDF, which is served as a PDF`, async ({ request }) => {
      const res = await request.get(pdf);
      expect(res.status(), pdf).toBe(200);
      expect(res.headers()['content-type']).toContain('application/pdf');
      expect((await res.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-');
    });

    test(`no accessibility violations on ${path}`, async ({ page }) => {
      // No page fade: axe must read the final colours.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });

    test(`${path} prints as the document alone`, async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      await page.goto(path);
      await expect(page.locator('[data-cv]')).toBeVisible();
      for (const chrome of ['body > header', 'body > footer', '[data-cv-screen]']) await expect(page.locator(chrome)).toBeHidden();
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)');
    });
  }

  test('the home hero links to the CV PDF of its language', async ({ page, request }) => {
    for (const { home, pdf } of PAGES) {
      await page.goto(home);
      const link = page.locator('a[data-cv-link]');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', pdf);
      expect((await request.get(pdf)).status(), pdf).toBe(200);
    }
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
