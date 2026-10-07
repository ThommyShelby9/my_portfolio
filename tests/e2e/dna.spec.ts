import { expect, test, type Page } from '@playwright/test';

/** True when this browser can create a WebGL context (headless runs may not). */
async function hasWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  });
}

test.describe('DNA stage', () => {
  test('shows the poster first, then the live helix when WebGL is available', async ({ page }) => {
    await page.goto('/');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('aria-hidden', 'true');
    await expect(stage.locator('img[data-dna-poster]')).toBeAttached();
    test.skip(!(await hasWebGL(page)), 'no WebGL in this browser');
    await expect(stage).toHaveAttribute('data-dna-state', '3d', { timeout: 10_000 });
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 15_000 });
    await expect(stage.locator('canvas')).toBeVisible();
  });

  test('falls back to the poster when the WebGL context is lost', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await hasWebGL(page)), 'no WebGL in this browser');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 15_000 });
    await stage.locator('canvas').evaluate((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await expect(stage).toHaveAttribute('data-dna-state', 'poster');
    await expect(stage.locator('img[data-dna-poster]')).toBeVisible();
  });

  test('never mounts a canvas under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(2500);
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-state', 'poster');
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(stage.locator('img[data-dna-poster]')).toBeVisible();
    await context.close();
  });

  test('pauses rendering when the tab is hidden', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await hasWebGL(page)), 'no WebGL in this browser');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-running', 'true', { timeout: 15_000 });
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(stage).toHaveAttribute('data-dna-running', 'false');
  });
});

test.describe('traversal', () => {
  test('opens a space after the hero and flies into the helix on scroll', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    test.skip(!(await hasWebGL(page)), 'no WebGL in this browser');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 20_000 });
    const space = page.locator('div[data-dna-traverse]');
    const box = await space.boundingBox();
    expect(box!.height).toBeGreaterThan(600);
    await space.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY + (el as HTMLElement).offsetHeight * 0.3));
    await expect.poll(async () => Number(await stage.getAttribute('data-dna-tunnel')), { timeout: 5000 }).toBeGreaterThan(0.9);
    await page.locator('#adn').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect.poll(async () => Number(await stage.getAttribute('data-dna-tunnel')), { timeout: 5000 }).toBe(0);
  });

  test('takes no room without the live helix', async ({ browser }) => {
    for (const options of [{ reducedMotion: 'reduce' as const }, { javaScriptEnabled: false }]) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      // Static content only: the DOM is enough (the full load event can lag on a busy machine).
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      await expect(page.locator('div[data-dna-traverse]')).toBeHidden();
      await context.close();
    }
  });
});

test.describe('every page', () => {
  test('inner pages carry the helix too, quieter, in their own shape', async ({ page }) => {
    test.setTimeout(120_000);
    for (const [path, scene] of [['/realisations', '1'], ['/realisations/ubbfy', '3'], ['/explorations', '4'], ['/a-propos', '2'], ['/contact', '5'], ['/cgu', '5']]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const stage = page.locator('[data-dna-stage]');
      await expect(stage, path).toHaveAttribute('data-dna-dim', 'true');
      await expect(stage, path).toHaveAttribute('data-dna-scene', scene, { timeout: 10_000 });
    }
  });

  test('the helix survives client navigation and goes live on an inner page', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/realisations');
    test.skip(!(await hasWebGL(page)), 'no WebGL in this browser');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 20_000 });
    await page.locator('main a[href="/realisations/ubbfy"]').first().click();
    await expect(page).toHaveURL(/\/realisations\/ubbfy$/);
    await expect(stage).toHaveAttribute('data-dna-scene', '3');
    await expect(stage).toHaveAttribute('data-dna-ready', 'true');
    await expect(stage.locator('canvas')).toHaveCount(1);
  });

  test('inner pages show the poster under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/a-propos', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-dna-stage] canvas')).toHaveCount(0);
    await expect(page.locator('img[data-dna-poster]')).toBeVisible();
    await context.close();
  });
});
