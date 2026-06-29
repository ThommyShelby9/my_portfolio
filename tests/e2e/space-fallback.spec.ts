import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home renders the hero heading independent of WebGL', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
})

test('space layer exists and is hidden from assistive tech', async ({ page }) => {
  await page.goto('/')
  const space = page.locator('.space-bg')
  await expect(space).toHaveCount(1)
  await expect(space).toHaveAttribute('aria-hidden', 'true')
})

test('reduced motion: content + fallback render with no critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
  await expect(page.locator('.space-bg')).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
