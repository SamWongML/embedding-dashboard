import { expect, test } from '@playwright/test'

function parseDurationMs(value: string): number {
  const firstDuration = value.split(',')[0]?.trim() ?? '0s'

  if (firstDuration.endsWith('ms')) {
    return Number.parseFloat(firstDuration)
  }

  if (firstDuration.endsWith('s')) {
    return Number.parseFloat(firstDuration) * 1000
  }

  return Number.NaN
}

test.describe('Sheet motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/records')
  })

  test('uses ~200ms open/close timing on records details sheet', async ({ page }) => {
    await page.getByRole('button', { name: 'View record details' }).first().click()

    const dialog = page.getByRole('dialog', { name: 'Record Details' })
    await expect(dialog).toBeVisible()

    const durations = await dialog.evaluate((element) => {
      const styles = window.getComputedStyle(element)
      return {
        animationDuration: styles.animationDuration,
        transitionDuration: styles.transitionDuration,
      }
    })

    const animationMs = parseDurationMs(durations.animationDuration)
    const transitionMs = parseDurationMs(durations.transitionDuration)

    expect(animationMs).toBeGreaterThanOrEqual(180)
    expect(animationMs).toBeLessThanOrEqual(260)
    expect(transitionMs).toBeGreaterThanOrEqual(180)
    expect(transitionMs).toBeLessThanOrEqual(260)
  })

  test('keeps content mounted during close animation before unmounting', async ({ page }) => {
    await page.getByRole('button', { name: 'View record details' }).first().click()

    const dialog = page.getByRole('dialog', { name: 'Record Details' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Content' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Close' }).click()

    const closeStateSnapshot = await page.evaluate(() => {
      const dialogElement = document.querySelector('[role="dialog"]')
      return {
        hasContentHeading: Boolean(dialogElement?.querySelector('h4')),
        state: dialogElement?.getAttribute('data-state') ?? null,
        stillMounted: Boolean(dialogElement),
      }
    })

    expect(closeStateSnapshot.stillMounted).toBe(true)
    expect(closeStateSnapshot.state).toBe('closed')
    expect(closeStateSnapshot.hasContentHeading).toBe(true)

    await page.waitForTimeout(280)
    await expect(page.getByRole('dialog', { name: 'Record Details' })).toHaveCount(0)
  })
})
