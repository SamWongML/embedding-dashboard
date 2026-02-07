import { expect, test, type Locator, type Page } from '@playwright/test'

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

async function hoverChartSurfaceByHeading(page: Page, heading: string): Promise<Locator> {
  const headingText = page.getByText(heading, { exact: true }).first()
  await expect(headingText).toBeVisible()

  const chartRegion = page
    .getByText(heading, { exact: true })
    .first()
    .locator('xpath=following::*[name()="svg"][1]')

  await expect(chartRegion).toBeVisible()

  const box = await chartRegion.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return chartRegion

  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.38)
  return chartRegion
}

test.describe('Dark mode chart interactions', () => {
  test('service usage bar hover avoids bright tooltip cursor overlays', async ({ page }) => {
    await gotoWithDarkMode(page, '/')
    await expect(page.getByRole('heading', { name: 'Server Status' })).toBeVisible()

    await hoverChartSurfaceByHeading(page, 'Service Usage')

    await expect(page.locator('.recharts-tooltip-cursor')).toHaveCount(0)
  })

  test('top hits bar hover avoids bright tooltip cursor overlays', async ({ page }) => {
    await gotoWithDarkMode(page, '/metrics')
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible()

    await hoverChartSurfaceByHeading(page, 'Most Accessed Embeddings')

    await expect(page.locator('.recharts-tooltip-cursor')).toHaveCount(0)
  })

  test('embedding trends hover avoids bright white active dots', async ({ page }) => {
    await gotoWithDarkMode(page, '/metrics')
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible()

    const chartRegion = await hoverChartSurfaceByHeading(page, 'Embedding Trends')
    await expect(
      chartRegion.locator(
        'circle[fill="white"], circle[fill="#fff"], circle[fill="#ffffff"], circle[fill="rgb(255, 255, 255)"]'
      )
    ).toHaveCount(0)
  })
})
