import { expect, test, type Page } from '@playwright/test'

interface CloseFrameSample {
  t: number
  state: string | null
  opacity: number
  hasContentHeading: boolean
}

interface CloseTrace {
  samples: CloseFrameSample[]
  unmountedAtMs: number | null
  error?: string
}

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

async function captureRecordsSheetCloseTrace(page: Page): Promise<CloseTrace> {
  return page.evaluate(() => {
    return new Promise<CloseTrace>((resolve) => {
      const getDialog = () =>
        document.querySelector<HTMLElement>('[role="dialog"]')
      const initialDialog = getDialog()

      if (!initialDialog) {
        resolve({
          samples: [],
          unmountedAtMs: null,
          error: 'dialog-not-found',
        })
        return
      }

      const closeButton =
        initialDialog.querySelector<HTMLElement>('button[aria-label="Close"]') ??
        Array.from(initialDialog.querySelectorAll<HTMLElement>('button')).find(
          (button) =>
            button.textContent?.trim() === 'Close' ||
            button.querySelector('.sr-only')?.textContent?.trim() === 'Close'
        )

      if (!closeButton) {
        resolve({
          samples: [],
          unmountedAtMs: null,
          error: 'close-button-not-found',
        })
        return
      }

      const samples: CloseFrameSample[] = []
      let startTime = 0

      const sample = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp
        }

        const dialog = getDialog()
        if (!dialog) {
          resolve({
            samples,
            unmountedAtMs: Math.round(timestamp - startTime),
          })
          return
        }

        const opacity = Number.parseFloat(window.getComputedStyle(dialog).opacity)
        samples.push({
          t: Math.round(timestamp - startTime),
          state: dialog.getAttribute('data-state'),
          opacity: Number.isFinite(opacity) ? opacity : 1,
          hasContentHeading: Boolean(dialog.querySelector('h4')),
        })

        if (timestamp - startTime > 600) {
          resolve({
            samples,
            unmountedAtMs: null,
            error: 'close-timeout',
          })
          return
        }

        requestAnimationFrame(sample)
      }

      closeButton.click()
      requestAnimationFrame(sample)
    })
  })
}

async function captureDialogTraceUntilUnmount(page: Page): Promise<CloseTrace> {
  return page.evaluate(() => {
    return new Promise<CloseTrace>((resolve) => {
      const getDialog = () =>
        document.querySelector<HTMLElement>('[role="dialog"]')
      const initialDialog = getDialog()

      if (!initialDialog) {
        resolve({
          samples: [],
          unmountedAtMs: null,
          error: 'dialog-not-found',
        })
        return
      }

      const samples: CloseFrameSample[] = []
      let startTime = 0

      const sample = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp
        }

        const dialog = getDialog()
        if (!dialog) {
          resolve({
            samples,
            unmountedAtMs: Math.round(timestamp - startTime),
          })
          return
        }

        const opacity = Number.parseFloat(window.getComputedStyle(dialog).opacity)
        samples.push({
          t: Math.round(timestamp - startTime),
          state: dialog.getAttribute('data-state'),
          opacity: Number.isFinite(opacity) ? opacity : 1,
          hasContentHeading: Boolean(dialog.querySelector('h4')),
        })

        if (timestamp - startTime > 600) {
          resolve({
            samples,
            unmountedAtMs: null,
            error: 'close-timeout',
          })
          return
        }

        requestAnimationFrame(sample)
      }

      requestAnimationFrame(sample)
    })
  })
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

  test('uses ~150ms overlay timing on records details sheet', async ({ page }) => {
    await page.getByRole('button', { name: 'View record details' }).first().click()

    const dialog = page.getByRole('dialog', { name: 'Record Details' })
    await expect(dialog).toBeVisible()

    const timing = await page.evaluate(() => {
      const dialogElement = document.querySelector<HTMLElement>('[role="dialog"]')
      const overlayElement = document.querySelector<HTMLElement>(
        '[data-slot="sheet-overlay"]'
      )

      if (!dialogElement || !overlayElement) {
        return null
      }

      const dialogStyles = window.getComputedStyle(dialogElement)
      const overlayStyles = window.getComputedStyle(overlayElement)

      return {
        dialogAnimationDuration: dialogStyles.animationDuration,
        overlayAnimationDuration: overlayStyles.animationDuration,
      }
    })

    expect(timing).not.toBeNull()
    if (!timing) {
      return
    }

    const dialogMs = parseDurationMs(timing.dialogAnimationDuration)
    const overlayMs = parseDurationMs(timing.overlayAnimationDuration)

    expect(dialogMs).toBeGreaterThanOrEqual(180)
    expect(dialogMs).toBeLessThanOrEqual(260)
    expect(overlayMs).toBeGreaterThanOrEqual(120)
    expect(overlayMs).toBeLessThanOrEqual(180)
  })

  test('keeps content mounted and fades during close animation before unmounting', async ({ page }) => {
    await page.getByRole('button', { name: 'View record details' }).first().click()

    const dialog = page.getByRole('dialog', { name: 'Record Details' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Content' })).toBeVisible()

    const closeTrace = await captureRecordsSheetCloseTrace(page)

    expect(closeTrace.error).toBeUndefined()
    expect(closeTrace.unmountedAtMs).not.toBeNull()
    expect(closeTrace.samples.length).toBeGreaterThan(0)
    expect(closeTrace.samples.every((sample) => sample.hasContentHeading)).toBe(
      true
    )
    expect(closeTrace.samples.some((sample) => sample.state === 'closed')).toBe(
      true
    )

    const minOpacity = Math.min(...closeTrace.samples.map((sample) => sample.opacity))
    expect(minOpacity).toBeLessThan(1)
    expect(minOpacity).toBeLessThan(0.2)
  })

  test('mobile sidebar sheet fades during close and unmounts cleanly', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/records')

    await page.getByRole('button', { name: 'Toggle Sidebar' }).first().click()

    const sidebarDialog = page.getByRole('dialog', { name: 'Sidebar' })
    await expect(sidebarDialog).toBeVisible()

    const closeTracePromise = captureDialogTraceUntilUnmount(page)
    await page.keyboard.press('Escape')
    const closeTrace = await closeTracePromise

    expect(closeTrace.error).toBeUndefined()
    expect(closeTrace.unmountedAtMs).not.toBeNull()
    expect(closeTrace.samples.length).toBeGreaterThan(0)
    expect(closeTrace.samples.some((sample) => sample.state === 'closed')).toBe(
      true
    )

    const minOpacity = Math.min(...closeTrace.samples.map((sample) => sample.opacity))
    expect(minOpacity).toBeLessThan(1)
    expect(minOpacity).toBeLessThan(0.2)
  })
})
