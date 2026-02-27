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
    await expect(page.getByText('Embedding Trends')).toBeVisible()
    await expect(page.getByText('Most Accessed Embeddings')).toBeVisible()
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

  test('collapses and expands', async ({ page }) => {
    await page.goto('/')

    // In medium viewport mode the sidebar logo acts as the collapse/expand control.
    const collapseButton = page.getByRole('button', { name: /Toggle sidebar/i })
    await collapseButton.click()

    // Sidebar state should collapse.
    const sidebar = page.locator('[data-slot="sidebar"][data-state]')
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed')

    // Click again to expand
    await collapseButton.click()
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')
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

  test('stacks interval selector below the title on narrow screens', async ({
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

    expect(tabsBox.y).toBeGreaterThanOrEqual(headingBox.y + headingBox.height)
  })
})
