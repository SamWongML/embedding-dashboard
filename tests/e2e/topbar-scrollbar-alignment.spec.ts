import { expect, test, type Page } from '@playwright/test'

async function gotoWithDarkMode(page: Page, path: string) {
  await page.route('**/api/preferences', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        theme: 'dark',
      }),
    })
  })

  await page.addInitScript(() => {
    window.localStorage.setItem('embedding-dashboard-theme', 'dark')
  })

  await page.goto(path)
  await page.evaluate(() => {
    window.localStorage.setItem('embedding-dashboard-theme', 'dark')
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
  })

  await expect(page.locator('html')).toHaveClass(/dark/)
}

test.describe('Topbar Scrollbar Alignment', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('keeps sticky topbar aligned with dashboard scroll root edge', async ({ page }) => {
    await gotoWithDarkMode(page, '/')

    const commandPaletteTrigger = page.getByRole('button', { name: /Search\.\.\./ })
    await expect(commandPaletteTrigger).toBeVisible()

    const dashboardScrollRoot = page.locator('[data-slot="dashboard-scroll-root"]')
    await expect(dashboardScrollRoot).toBeVisible()

    const layoutMetrics = await page.evaluate(() => {
      const scrollRoot = document.querySelector(
        '[data-slot="dashboard-scroll-root"]'
      ) as HTMLElement | null
      const topbar = document.querySelector('header') as HTMLElement | null

      if (!scrollRoot || !topbar) {
        return null
      }

      const scrollRootRect = scrollRoot.getBoundingClientRect()
      const headerBefore = topbar.getBoundingClientRect()
      const scrollTopBefore = scrollRoot.scrollTop
      const canScroll = scrollRoot.scrollHeight > scrollRoot.clientHeight
      const targetScrollTop = Math.min(scrollRoot.scrollHeight - scrollRoot.clientHeight, 320)

      scrollRoot.scrollTop = targetScrollTop

      const headerAfter = topbar.getBoundingClientRect()
      const scrollTopAfter = scrollRoot.scrollTop

      return {
        canScroll,
        scrollTopBefore,
        scrollTopAfter,
        headerTopBefore: headerBefore.top,
        headerTopAfter: headerAfter.top,
        headerRightAfter: headerAfter.right,
        scrollRootClientRight: scrollRootRect.left + scrollRoot.clientWidth,
      }
    })

    expect(layoutMetrics).not.toBeNull()
    if (!layoutMetrics) {
      return
    }

    expect(layoutMetrics.canScroll).toBe(true)
    expect(layoutMetrics.scrollTopAfter).toBeGreaterThan(layoutMetrics.scrollTopBefore)
    expect(Math.abs(layoutMetrics.headerTopAfter - layoutMetrics.headerTopBefore)).toBeLessThanOrEqual(1)
    expect(Math.abs(layoutMetrics.headerRightAfter - layoutMetrics.scrollRootClientRight)).toBeLessThanOrEqual(1)

    await commandPaletteTrigger.click()
    await expect(page.getByPlaceholder('Type a command or search...')).toBeVisible()
  })
})
