import { expect, test, type Page } from '@playwright/test'

type DashboardPageFootMetrics = {
  gapToViewportBottom: number
  paddingBottom: number
}

async function measureDashboardPageFootGap(page: Page): Promise<DashboardPageFootMetrics> {
  const metrics = await page.evaluate(async () => {
    const scrollRoot = document.querySelector(
      '[data-slot="dashboard-scroll-root"]'
    ) as HTMLElement | null
    const shell = document.querySelector(
      '[data-slot="page-content-shell"]'
    ) as HTMLElement | null
    const shellLastChild = shell?.lastElementChild as HTMLElement | null

    if (!scrollRoot || !shell || !shellLastChild) {
      return null
    }

    scrollRoot.scrollTop = scrollRoot.scrollHeight
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })

    const viewportBottom = window.innerHeight
    const lastChildBottom = shellLastChild.getBoundingClientRect().bottom
    const shellStyles = window.getComputedStyle(shell)

    return {
      gapToViewportBottom: viewportBottom - lastChildBottom,
      paddingBottom: Number.parseFloat(shellStyles.paddingBottom),
    }
  })

  expect(metrics).not.toBeNull()
  if (!metrics) {
    throw new Error('Unable to measure dashboard page-foot gap')
  }

  return metrics
}

test.describe('Page shell spacing contract', () => {
  test('keeps a visible page-foot gap on dashboard routes at scroll end', async ({ page }) => {
    const dashboardRoutes = [
      { path: '/records', heading: 'Embedding Records' },
      { path: '/settings', heading: 'Settings' },
    ] as const

    for (const route of dashboardRoutes) {
      await page.goto(route.path)
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible()

      const metrics = await measureDashboardPageFootGap(page)
      expect(metrics.gapToViewportBottom).toBeGreaterThanOrEqual(28)
      expect(metrics.gapToViewportBottom).toBeLessThanOrEqual(36)
      expect(metrics.paddingBottom).toBeGreaterThan(0)
    }
  })

  test('safe-area inset increases visible dashboard page-foot gap', async ({ page }) => {
    await page.goto('/records')
    await expect(page.getByRole('heading', { name: 'Embedding Records' })).toBeVisible()

    const baseMetrics = await measureDashboardPageFootGap(page)

    await page.addStyleTag({
      content: ':root { --space-safe-bottom: 18px !important; }',
    })

    const safeAreaMetrics = await measureDashboardPageFootGap(page)
    const gapDelta = safeAreaMetrics.gapToViewportBottom - baseMetrics.gapToViewportBottom

    expect(safeAreaMetrics.gapToViewportBottom).toBeGreaterThan(
      baseMetrics.gapToViewportBottom
    )
    expect(gapDelta).toBeGreaterThanOrEqual(17)
    expect(gapDelta).toBeLessThanOrEqual(19)
  })

  test('keeps tokenized page shell spacing on login route', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Sign in')).toBeVisible()

    const loginPaddingBottom = await page
      .locator('[data-slot="page-content-shell"]')
      .first()
      .evaluate((node) => {
        const styles = window.getComputedStyle(node as HTMLElement)
        return Number.parseFloat(styles.paddingBottom)
      })

    expect(loginPaddingBottom).toBeGreaterThan(0)
  })
})
