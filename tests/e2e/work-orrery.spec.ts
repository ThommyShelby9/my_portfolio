import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('work page lists all case studies (SSR, independent of WebGL)', async ({ page }) => {
  await page.goto('/work')
  // The DOM list renders server-side; at least several entries present.
  const entries = page.locator('.work-list .entry')
  await expect(entries.first()).toBeVisible()
  expect(await entries.count()).toBeGreaterThanOrEqual(5)
})

test('reduced motion: /work content renders with no critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/work')
  await expect(page.locator('.work-list .entry').first()).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
