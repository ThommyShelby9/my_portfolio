import { test, expect } from '@playwright/test'

test.describe('Brief 3D maquette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brief')
    await page.evaluate(() => localStorage.clear())
  })

  test('desktop: canvas mounts in maquette column', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/brief')
    const canvas = page.locator('[data-test="brief-maquette"] canvas')
    await expect(canvas).toBeVisible({ timeout: 15000 })
    const box = await canvas.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(0)
    expect(box?.height ?? 0).toBeGreaterThan(0)
  })

  test('mobile: no maquette column rendered', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/brief')
    // wait briefly to let the capability check resolve
    await page.waitForTimeout(500)
    const maquette = page.locator('[data-test="brief-maquette"]')
    await expect(maquette).toHaveCount(0)
  })

  test('step 5 is reachable and shows recap with submit button', async ({ page }) => {
    // use mobile viewport so the 3D canvas doesn't intercept pointer events
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/brief')

    // step 1
    await page.locator('text=Construire un produit depuis zéro').click()
    await page.locator('textarea').first().fill('Une plateforme de paiement B2B pour PME africaines.')
    await page.locator('text=Continuer →').click()

    // step 2 — pick first option of each radio group
    await page.locator('text=Idée / spec papier').first().click()
    await page.locator('text=Solo').first().click()
    await page.locator('text=Continuer →').click()

    // step 3
    await page.locator('text=Flexible').first().click()
    await page.locator('text=Pas encore défini').first().click()
    await page.locator('text=Continuer →').click()

    // step 4
    const inputs = page.locator('input[type="text"], input[type="email"]')
    await inputs.nth(0).fill('Test')
    await inputs.nth(1).fill('User')
    await inputs.nth(2).fill('test@example.com')
    await page.locator('text=Continuer →').click()

    // step 5
    await expect(page.locator('text=Inspecte ton brief')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Envoyer le brief')).toBeVisible()
  })
})
