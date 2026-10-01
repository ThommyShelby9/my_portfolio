import { expect, test } from '@playwright/test';

test.describe('sculpture', () => {
  test('mounts the 3D scene after idle on a capable desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop behaviour');
    test.setTimeout(60_000);
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-state', '3d', { timeout: 8000 });
    // Software WebGL (headless, no GPU) blocks the main thread for seconds while compiling the first frame.
    await expect(stage.locator('canvas')).toBeVisible({ timeout: 20000 });
    await expect(stage).toHaveAttribute('aria-hidden', 'true');
    await expect(stage).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
    await expect(page.locator('[data-sculpture-poster]')).toBeHidden();
  });

  test('?sculpture=poster is inert in the production build: nothing is hidden', async ({ page }) => {
    // Poster mode only exists in a build made with NEXT_PUBLIC_SCULPTURE_POSTER=1 (pnpm sculpture:poster).
    await page.goto('/?sculpture=poster');
    // Hydrated: the stage's mount effect (which would set poster mode) has run.
    await expect(page.locator('html')).toHaveClass(/reveal-ready/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeAttached();
    expect(await page.locator('html').getAttribute('data-poster')).toBeNull();
    await expect(page.locator('[data-sculpture-stage]')).not.toHaveAttribute('data-trajectory', 'on');
    expect(await page.getByRole('heading', { level: 1 }).evaluate((h) => getComputedStyle(h).visibility)).toBe('visible');
  });

  test('shows the poster under reduced motion, with no canvas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(2500);
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-state', 'poster');
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(page.locator('[data-sculpture-poster]')).toBeVisible();
  });

  test('under reduced motion the stage is not fixed on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop behaviour');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const position = await page.locator('[data-sculpture-stage]').evaluate((el) => getComputedStyle(el).position);
    expect(position).not.toBe('fixed');
  });

  test('falls back to the poster when WebGL is unavailable, without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      // Test double: every WebGL context request is refused, other contexts work normally.
      type AnyGetContext = (this: HTMLCanvasElement, ...args: unknown[]) => unknown;
      const proto = HTMLCanvasElement.prototype as unknown as { getContext: AnyGetContext };
      const original = proto.getContext;
      proto.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
        if (typeof args[0] === 'string' && args[0].startsWith('webgl')) return null;
        return original.apply(this, args);
      };
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-sculpture-stage]')).toHaveAttribute('data-state', 'poster');
    const poster = page.locator('[data-sculpture-poster]');
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('stops rendering when scrolled far away', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop behaviour');
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-state', '3d', { timeout: 8000 });
    await expect(stage).toHaveAttribute('data-running', 'true');
    await page.getByRole('heading', { name: /Trois produits/ }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await expect(stage).toHaveAttribute('data-running', 'false', { timeout: 4000 });
  });
});
