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

test.describe('Traces Explorer', () => {
  test('renders traces table and desktop waterfall inspector', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Recent Traces')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Search traces' })).toBeVisible()
    await page.getByText('tr-a8f3c2').first().click()

    await expect(page.getByRole('heading', { name: 'Span Waterfall' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'API Gateway', exact: true })).toBeVisible()
  })

  test('filters traces through search tokens and plain terms', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByRole('textbox', { name: 'Search traces' })
    const traceRow = (traceId: string) =>
      page.getByRole('row', { name: new RegExp(traceId, 'i') })
    await searchInput.fill('status:error')

    await expect(traceRow('tr-d1a6f9')).toBeVisible()
    await expect(traceRow('tr-h5e0d3')).toBeVisible()
    await expect(traceRow('tr-a8f3c2')).toHaveCount(0)

    await searchInput.fill('3200')
    await expect(traceRow('tr-d1a6f9')).toBeVisible()
    await expect(traceRow('tr-h5e0d3')).toHaveCount(0)

    await searchInput.fill('error')
    await expect(traceRow('tr-d1a6f9')).toBeVisible()
    await expect(traceRow('tr-h5e0d3')).toBeVisible()
  })

  test('keeps desktop waterfall viewport stable while delayed span detail loads', async ({ page }) => {
    const delayedSpanRequests: string[] = []

    await page.route('**/traces/*/spans', async (route) => {
      delayedSpanRequests.push(route.request().url())
      await new Promise((resolve) => setTimeout(resolve, 700))
      await route.continue()
    })

    await page.goto('/')

    const viewport = page.locator('[data-slot="trace-waterfall-desktop-viewport"]')
    await expect(page.getByRole('heading', { name: 'Span Waterfall' })).toBeVisible()
    await expect(viewport).toBeVisible()
    await expect(page.getByRole('button', { name: 'API Gateway', exact: true })).toBeVisible()

    const baseHeight = await viewport.evaluate((element) =>
      Math.round((element as HTMLElement).getBoundingClientRect().height)
    )

    await page.getByText('tr-e2b7a0').first().click()
    const loading = viewport.locator('[data-slot="trace-waterfall-loading"]')
    await page.waitForTimeout(50)

    let loadingHeight = baseHeight
    if (delayedSpanRequests.length > 0) {
      await expect(loading).toBeVisible()
      loadingHeight = await viewport.evaluate((element) =>
        Math.round((element as HTMLElement).getBoundingClientRect().height)
      )
    }

    await expect(loading).toHaveCount(0)
    await expect(page.getByText('tr-e2b7a0 · 24 spans')).toBeVisible()
    await expect(viewport.getByRole('button', { name: 'API Gateway', exact: true })).toBeVisible()

    const finalHeight = await viewport.evaluate((element) =>
      Math.round((element as HTMLElement).getBoundingClientRect().height)
    )

    expect(loadingHeight).toBe(baseHeight)
    expect(finalHeight).toBe(baseHeight)
  })
})

test.describe('Traces Explorer Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('shows compact trace cards and opens waterfall sheet from row tap', async ({ page }) => {
    await page.goto('/')

    await page.getByText('Recent Traces').scrollIntoViewIfNeeded()
    await expect(page.locator('table')).toHaveCount(0)

    await page.getByText('tr-a8f3c2').first().click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText('Span Waterfall')).toBeVisible()
    await expect(sheet.getByRole('button', { name: 'API Gateway', exact: true })).toBeVisible()
  })

  test('keeps waterfall scrolling contained to the mobile waterfall region', async ({ page }) => {
    await page.goto('/')

    await page.getByText('Recent Traces').scrollIntoViewIfNeeded()
    await page.getByText('tr-e2b7a0').first().click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()

    const scrollRegion = sheet.locator('[data-slot="trace-waterfall-scroll-region"]')
    await expect(scrollRegion).toBeVisible()

    const scrollMetrics = await page.evaluate(() => {
      const region = document.querySelector(
        '[data-slot="trace-waterfall-scroll-region"]'
      ) as HTMLElement | null
      const sheetContent = document.querySelector(
        '[data-slot="sheet-content"]'
      ) as HTMLElement | null

      if (!region || !sheetContent) {
        return null
      }

      const sheetTopBefore = sheetContent.scrollTop
      const regionTopBefore = region.scrollTop
      const regionLeftBefore = region.scrollLeft

      region.scrollTop = Math.min(region.scrollHeight, 260)
      region.scrollLeft = Math.min(region.scrollWidth, 180)

      return {
        regionClientHeight: region.clientHeight,
        regionScrollHeight: region.scrollHeight,
        regionClientWidth: region.clientWidth,
        regionScrollWidth: region.scrollWidth,
        regionTopBefore,
        regionTopAfter: region.scrollTop,
        regionLeftBefore,
        regionLeftAfter: region.scrollLeft,
        sheetTopBefore,
        sheetTopAfter: sheetContent.scrollTop,
      }
    })

    expect(scrollMetrics).not.toBeNull()
    if (!scrollMetrics) {
      return
    }

    expect(scrollMetrics.regionScrollHeight).toBeGreaterThan(scrollMetrics.regionClientHeight)
    expect(scrollMetrics.regionScrollWidth).toBeGreaterThan(scrollMetrics.regionClientWidth)
    expect(scrollMetrics.regionTopAfter).toBeGreaterThan(scrollMetrics.regionTopBefore)
    expect(scrollMetrics.regionLeftAfter).toBeGreaterThan(scrollMetrics.regionLeftBefore)
    expect(Math.abs(scrollMetrics.sheetTopAfter - scrollMetrics.sheetTopBefore)).toBeLessThanOrEqual(1)
  })
})

test.describe('Traces Explorer Dark Mode', () => {
  test('reuses chart tooltip card styling for waterfall spans', async ({ page }) => {
    await gotoWithDarkMode(page, '/')

    await expect(page.getByText('Recent Traces')).toBeVisible()
    await page.getByText('tr-a8f3c2').first().click()
    await expect(page.getByRole('heading', { name: 'Span Waterfall' })).toBeVisible()

    const spanBar = page
      .locator('button[data-slot="tooltip-trigger"]')
      .filter({ hasText: /ms/i })
      .first()
    await expect(spanBar).toBeVisible()
    await spanBar.hover()

    const tooltip = page.locator('[data-slot="tooltip-content"]')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('Scope')
    await expect(tooltip).toContainText(/\u00b7 OK \/ (HTTP|Middleware|Model|DB|Cache|Queue|Serialize|Other)/)
    await expect(tooltip).toContainText('Timing')
    await expect(tooltip).toContainText(/\+\d+ms \u00b7 \d+ms/)

    const tooltipCard = tooltip.locator(':scope > div')
    await expect(tooltipCard).toHaveClass(/bg-popover/)
    await expect(tooltipCard).toHaveClass(/border-border/)
    await expect(tooltipCard).toHaveClass(/shadow-md/)

    await expect(tooltip).not.toHaveClass(/bg-foreground/)
    await expect(tooltip.locator('.rounded-full')).toHaveCount(0)
    await expect(tooltip.locator('svg')).toHaveCount(0)
  })
})
