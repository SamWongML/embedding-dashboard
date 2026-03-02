import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows server status page by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Metrics & Traces' })).toBeVisible()
  })

  test('navigates to metrics page', async ({ page }) => {
    await page.getByRole('link', { name: 'Usage Analytics' }).click()
    await expect(page.getByRole('heading', { name: 'Usage Analytics' })).toBeVisible()
  })

  test('navigates to text embedding page', async ({ page }) => {
    await page.getByRole('link', { name: 'Text Embedding' }).click()
    await expect(page.getByRole('heading', { name: 'Text Embedding' })).toBeVisible()
  })

  test('navigates to search page', async ({ page }) => {
    await page.getByRole('link', { name: 'Hybrid Search' }).click()
    await expect(page.getByRole('heading', { name: 'Hybrid Search' })).toBeVisible()
  })

  test('navigates to records page', async ({ page }) => {
    await page.getByRole('link', { name: 'Records' }).click()
    await expect(page.getByRole('heading', { name: 'Embedding Records' })).toBeVisible()
  })

  test('navigates to graph page', async ({ page }) => {
    await page.getByRole('link', { name: 'Graph' }).click()
    await expect(page.getByRole('heading', { name: 'Knowledge Graph' })).toBeVisible()
  })

  test('navigates to users page', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click()
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible()
  })

  test('navigates to workspace admin page', async ({ page }) => {
    await page.getByRole('link', { name: 'Workspace' }).click()
    await expect(page.getByRole('heading', { name: 'Workspace Administration' })).toBeVisible()
  })

  test('redirects deprecated settings workspace tab to workspace admin page', async ({
    page,
  }) => {
    await page.goto('/settings?tab=workspace')
    await expect(page).toHaveURL('/admin/workspace')
    await expect(page.getByRole('heading', { name: 'Workspace Administration' })).toBeVisible()
  })
})

test.describe('Command Menu', () => {
  test('opens with keyboard shortcut', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Meta+k')
    await expect(page.getByPlaceholder('Type a command or search...')).toBeVisible()
  })

  test('navigates via command menu', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Meta+k')
    await page.getByPlaceholder('Type a command or search...').fill('usage')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Usage Analytics' })).toBeVisible()
  })
})

test.describe('Usage Analytics header layout', () => {
  test('keeps title and interval selector on one row at desktop widths', async ({
    page,
  }) => {
    await page.goto('/metrics')

    const heading = page.getByRole('heading', { name: 'Usage Analytics' })
    const intervalTabs = page.locator(
      '[data-slot="page-heading-actions"] [data-slot="tabs-list"]'
    )

    await expect(heading).toHaveCount(1)
    await expect(heading).toBeVisible()
    await expect(intervalTabs).toBeVisible()

    const headingBox = await heading.boundingBox()
    const tabsBox = await intervalTabs.boundingBox()
    expect(headingBox).not.toBeNull()
    expect(tabsBox).not.toBeNull()
    if (!headingBox || !tabsBox) {
      return
    }

    expect(Math.abs(tabsBox.y - headingBox.y)).toBeLessThanOrEqual(2)
  })

  test('switches periods and refreshes analytics content', async ({ page }) => {
    await page.goto('/metrics')

    await page.getByRole('tab', { name: '7d' }).click()

    await expect(page.getByRole('tab', { name: '7d' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.getByText('Operations')).toBeVisible()
    await expect(page.getByText('Activity Heatmap')).toBeVisible()
    await expect(page.locator('[data-slot="activity-heatmap-cell"]').first()).toBeVisible()
    await expect(page.getByText('Most Accessed Embeddings')).toBeVisible()
  })

  test('supports 30d week navigation controls in activity heatmap header', async ({ page }) => {
    await page.goto('/metrics')
    await page.getByRole('tab', { name: '30d' }).click()

    const previousWeekButton = page.getByRole('button', { name: 'Previous week' })
    const nextWeekButton = page.getByRole('button', { name: 'Next week' })
    const firstHeatmapCell = page.locator('[data-slot="activity-heatmap-cell"]').first()

    await expect(previousWeekButton).toBeVisible()
    await expect(nextWeekButton).toBeVisible()
    await expect(nextWeekButton).toBeDisabled()
    await expect(previousWeekButton).toBeEnabled()
    await expect(firstHeatmapCell).toBeVisible()

    const newestWindowFirstCellLabel = await firstHeatmapCell.getAttribute('aria-label')
    await previousWeekButton.click()
    await expect(nextWeekButton).toBeEnabled()

    const olderWindowFirstCellLabel = await firstHeatmapCell.getAttribute('aria-label')
    expect(olderWindowFirstCellLabel).not.toBe(newestWindowFirstCellLabel)

    await nextWeekButton.click()
    await expect(nextWeekButton).toBeDisabled()

    const resetWindowFirstCellLabel = await firstHeatmapCell.getAttribute('aria-label')
    expect(resetWindowFirstCellLabel).toBe(newestWindowFirstCellLabel)
  })

  test('positions activity heatmap to the right of operations on desktop', async ({
    page,
  }) => {
    await page.goto('/metrics')
    await expect(page.locator('[data-slot="activity-heatmap-cell"]').first()).toBeVisible()

    const trendsHeading = page.getByText('Operations', { exact: true }).first()
    const heatmapHeading = page.getByText('Activity Heatmap', { exact: true }).first()

    await expect(trendsHeading).toBeVisible()
    await expect(heatmapHeading).toBeVisible()

    const trendsBox = await trendsHeading.boundingBox()
    const heatmapBox = await heatmapHeading.boundingBox()
    expect(trendsBox).not.toBeNull()
    expect(heatmapBox).not.toBeNull()
    if (!trendsBox || !heatmapBox) {
      return
    }

    expect(Math.abs(heatmapBox.y - trendsBox.y)).toBeLessThanOrEqual(8)
    expect(heatmapBox.x).toBeGreaterThan(trendsBox.x + trendsBox.width * 0.55)

    const heatmapCard = heatmapHeading.locator('xpath=ancestor::*[@data-slot="card"][1]')
    const heatmapContent = heatmapCard.locator('[data-slot="card-content"]').first()
    const heatmapGrid = heatmapCard.locator('[data-slot="activity-heatmap-grid"]').first()

    await expect(heatmapGrid).toBeVisible()

    const heatmapContentBox = await heatmapContent.boundingBox()
    const heatmapGridBox = await heatmapGrid.boundingBox()
    expect(heatmapContentBox).not.toBeNull()
    expect(heatmapGridBox).not.toBeNull()
    if (!heatmapContentBox || !heatmapGridBox) {
      return
    }

    expect(heatmapGridBox.width / heatmapContentBox.width).toBeGreaterThanOrEqual(0.9)
  })

  test("matches usage analytics second-row height with metrics & traces", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await page.goto("/")
    const metricsRowHeight = await page.evaluate<number | null>(() => {
      const latencyCard = Array.from(document.querySelectorAll("[data-slot=\"card-title\"]"))
        .find((node) => node.textContent?.trim() === "Latency Distribution")
        ?.closest("[data-slot=\"card\"]")

      return latencyCard?.parentElement?.getBoundingClientRect().height ?? null
    })

    expect(metricsRowHeight).not.toBeNull()
    if (metricsRowHeight === null) {
      return
    }

    await page.goto("/metrics")
    const usageRowHeight = await page.evaluate<number | null>(() => {
      const trendsCard = Array.from(document.querySelectorAll("[data-slot=\"card-title\"]"))
        .find((node) => node.textContent?.trim() === "Operations")
        ?.closest("[data-slot=\"card\"]")

      return trendsCard?.parentElement?.getBoundingClientRect().height ?? null
    })

    expect(usageRowHeight).not.toBeNull()
    if (usageRowHeight === null) {
      return
    }

    expect(Math.abs(usageRowHeight - metricsRowHeight)).toBeLessThanOrEqual(2)
  })

  test("matches heatmap title-description spacing with metrics & traces row-2 cards", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await page.goto("/")
    const metricsSpacing = await page.evaluate<number | null>(() => {
      const throughputCard = Array.from(document.querySelectorAll("[data-slot=\"card-title\"]"))
        .find((node) => node.textContent?.trim() === "Throughput & Errors")
        ?.closest("[data-slot=\"card\"]")

      const title = throughputCard?.querySelector("[data-slot=\"card-title\"]")
      const description = throughputCard?.querySelector("[data-slot=\"card-description\"]")
      if (!title || !description) {
        return null
      }

      return description.getBoundingClientRect().top - title.getBoundingClientRect().bottom
    })

    expect(metricsSpacing).not.toBeNull()
    if (metricsSpacing === null) {
      return
    }

    await page.goto("/metrics")
    const heatmapSpacing = await page.evaluate<number | null>(() => {
      const heatmapCard = Array.from(document.querySelectorAll("[data-slot=\"card-title\"]"))
        .find((node) => node.textContent?.trim() === "Activity Heatmap")
        ?.closest("[data-slot=\"card\"]")

      const title = heatmapCard?.querySelector("[data-slot=\"card-title\"]")
      const description = heatmapCard?.querySelector("[data-slot=\"card-description\"]")
      if (!title || !description) {
        return null
      }

      return description.getBoundingClientRect().top - title.getBoundingClientRect().bottom
    })

    expect(heatmapSpacing).not.toBeNull()
    if (heatmapSpacing === null) {
      return
    }

    expect(Math.abs(heatmapSpacing - metricsSpacing)).toBeLessThanOrEqual(1)
  })
})

test.describe('Page heading anchor', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('keeps page title anchored consistently across routes', async ({ page }) => {
    await page.goto('/metrics')
    const metricsHeading = page.getByRole('heading', { name: 'Usage Analytics' })
    await expect(metricsHeading).toBeVisible()
    const metricsBox = await metricsHeading.boundingBox()
    expect(metricsBox).not.toBeNull()
    if (!metricsBox) {
      return
    }

    await page.goto('/records')
    const recordsHeading = page.getByRole('heading', { name: 'Embedding Records' })
    await expect(recordsHeading).toBeVisible()
    const recordsBox = await recordsHeading.boundingBox()
    expect(recordsBox).not.toBeNull()
    if (!recordsBox) {
      return
    }

    expect(Math.abs(metricsBox.x - recordsBox.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(metricsBox.y - recordsBox.y)).toBeLessThanOrEqual(1)
  })
})

test.describe('Sidebar', () => {
  test.use({ viewport: { width: 1024, height: 900 } })

  test('toggles sidebar state and restores it on second click', async ({ page }) => {
    await page.goto('/')

    // In medium viewport mode the sidebar logo acts as the collapse/expand control.
    const collapseButton = page.getByRole('button', { name: /Toggle sidebar/i }).first()
    const sidebar = page.locator('[data-slot="sidebar"][data-state]')
    const initialState = await sidebar.getAttribute('data-state')

    expect(initialState === 'expanded' || initialState === 'collapsed').toBe(true)

    await collapseButton.click()
    await expect(sidebar).not.toHaveAttribute('data-state', initialState ?? '')

    // Click again to restore the initial state.
    await collapseButton.click()
    await expect(sidebar).toHaveAttribute('data-state', initialState ?? '')
  })
})

test.describe('Sidebar mobile behavior', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('navigates home from sidebar logo and closes the temporary drawer', async ({
    page,
  }) => {
    await page.goto('/metrics')

    await page.getByRole('button', { name: 'Toggle Sidebar' }).first().click()
    const sidebarDialog = page.getByRole('dialog', { name: 'Sidebar' })
    await expect(sidebarDialog).toBeVisible()

    await page.getByRole('link', { name: 'Knowledge Base Studio' }).click()
    await expect(page).toHaveURL('/')
    // Dev note: ignore bottom-right Next.js dev badge overlap in localhost.
    await expect(sidebarDialog).toBeHidden()
  })

  test('closes the temporary drawer after navigation link click', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Toggle Sidebar' }).first().click()
    const sidebarDialog = page.getByRole('dialog', { name: 'Sidebar' })
    await expect(sidebarDialog).toBeVisible()

    await page.getByRole('link', { name: 'Usage Analytics' }).click()
    await expect(page.getByRole('heading', { name: 'Usage Analytics' })).toBeVisible()
    await expect(sidebarDialog).toBeHidden()
  })
})

test.describe('Usage Analytics mobile heading layout', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps interval selector aligned with the title on narrow screens', async ({
    page,
  }) => {
    await page.goto('/metrics')

    const heading = page.getByRole('heading', { name: 'Usage Analytics' })
    const intervalTabs = page.locator(
      '[data-slot="page-heading-actions"] [data-slot="tabs-list"]'
    )
    await expect(heading).toBeVisible()
    await expect(intervalTabs).toBeVisible()

    const headingBox = await heading.boundingBox()
    const tabsBox = await intervalTabs.boundingBox()
    expect(headingBox).not.toBeNull()
    expect(tabsBox).not.toBeNull()
    if (!headingBox || !tabsBox) {
      return
    }

    expect(Math.abs(tabsBox.y - headingBox.y)).toBeLessThanOrEqual(4)
  })

  test('stacks activity heatmap below operations on mobile', async ({ page }) => {
    await page.goto('/metrics')

    const trendsHeading = page.getByText('Operations', { exact: true }).first()
    const heatmapHeading = page.getByText('Activity Heatmap', { exact: true }).first()
    await expect(trendsHeading).toBeVisible()
    await expect(heatmapHeading).toBeVisible()

    const trendsBox = await trendsHeading.boundingBox()
    const heatmapBox = await heatmapHeading.boundingBox()
    expect(trendsBox).not.toBeNull()
    expect(heatmapBox).not.toBeNull()
    if (!trendsBox || !heatmapBox) {
      return
    }

    expect(heatmapBox.y).toBeGreaterThanOrEqual(trendsBox.y + trendsBox.height)
  })
})
