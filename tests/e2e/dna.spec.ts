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
