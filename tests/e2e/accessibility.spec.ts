import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = ['/', '/work', '/work/banque-regionale', '/about', '/contact', '/brief']

for (const route of ROUTES) {
  test(`a11y: ${route} has no critical violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze()
    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
  })
}

test('skip link is reachable via keyboard', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.className)
  expect(focused).toContain('skip-link')
})
