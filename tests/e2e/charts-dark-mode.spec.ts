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

async function readXAxisTickLabelsByHeading(page: Page, heading: string): Promise<string[]> {
  const chartRegion = page
    .getByText(heading, { exact: true })
    .first()
    .locator('xpath=following::*[name()="svg"][1]')
  await expect(chartRegion).toBeVisible()

  const labels = (await chartRegion
    .locator('.recharts-xAxis .recharts-cartesian-axis-tick-value')
    .allTextContents())
    .map((value) => value.trim())
    .filter((value) => /^\d{2}:\d{2}$/.test(value))

  return labels
}

interface LatencyDashLineSample {
  name: string
  dash1: number
  dash2: number
  total: number
  delta: number
  progress: number
}

interface LatencyDashFrameSample {
  t: number
  lines: LatencyDashLineSample[]
}

async function collectLatencyDashSamples(
  page: Page,
  options: {
    sampleCount?: number
    intervalMs?: number
  } = {}
): Promise<LatencyDashFrameSample[]> {
  const { sampleCount = 20, intervalMs = 25 } = options

  return page.evaluate(
    async ({ sampleCount, intervalMs }: { sampleCount: number; intervalMs: number }) => {
      const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))
      const selectLatencyChart = () => {
        const title = Array.from(document.querySelectorAll('*')).find(
          (node) => node.textContent?.trim() === 'Latency Distribution'
        )
        if (!title) return null

        const card = title.closest('.bg-card')
        if (!card) return null

        return Array.from(card.querySelectorAll('svg.recharts-surface')).find(
          (surface) => surface.querySelectorAll('path.recharts-curve.recharts-line-curve').length > 0
        ) ?? null
      }

      const waitStart = performance.now()
      while (!selectLatencyChart() && performance.now() - waitStart < 5000) {
        await sleep(16)
      }

      const chart = selectLatencyChart()
      if (!chart) return []

      const samples: LatencyDashFrameSample[] = []
      const sampleStart = performance.now()

      for (let index = 0; index < sampleCount; index += 1) {
        const lines = Array.from(
          chart.querySelectorAll<SVGPathElement>('path.recharts-curve.recharts-line-curve')
        ).map((path) => {
          const strokeDasharray = path.getAttribute('stroke-dasharray') ?? ''
          const dashValues = strokeDasharray
            .split(/[,\s]+/)
            .map((token) => Number.parseFloat(token))
            .filter((value) => Number.isFinite(value))
          const total = path.getTotalLength()
          const dash1 = dashValues[0] ?? Number.NaN
          const dash2 = dashValues[1] ?? Number.NaN
          const delta = Number.isFinite(total) && Number.isFinite(dash1) && Number.isFinite(dash2)
            ? Math.abs(total - (dash1 + dash2))
            : Number.NaN
          const progress = Number.isFinite(total) && total > 0 && Number.isFinite(dash1)
            ? dash1 / total
            : Number.NaN

          return {
            name: path.getAttribute('name') ?? 'line',
            dash1,
            dash2,
            total,
            delta,
            progress,
          }
        })

        samples.push({
          t: performance.now() - sampleStart,
          lines,
        })

        await sleep(intervalMs)
      }

      return samples
    },
    { sampleCount, intervalMs }
  )
}

function extractMinuteOfDay(label: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(label)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  return hour * 60 + minute
}

function getIntervalSet(labels: string[]) {
  const minutes = labels
    .map((label) => extractMinuteOfDay(label))
    .filter((value): value is number => value !== null)

  const intervals = new Set<number>()
  for (let index = 1; index < minutes.length; index += 1) {
    const previous = minutes[index - 1]!
    const current = minutes[index]!
    const normalizedDelta = (current - previous + 24 * 60) % (24 * 60)
    if (normalizedDelta > 0) {
      intervals.add(normalizedDelta)
    }
  }

  return intervals
}

test.describe('Dark mode chart interactions', () => {
  test('throughput and errors bar hover avoids bright tooltip cursor overlays', async ({ page }) => {
    await gotoWithDarkMode(page, '/')
    await expect(page.getByRole('heading', { name: 'Server Status' })).toBeVisible()

    await hoverChartSurfaceByHeading(page, 'Throughput & Errors')

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

  test('primary line charts do not render area fill paths', async ({ page }) => {
    await gotoWithDarkMode(page, '/')
    await expect(page.getByRole('heading', { name: 'Server Status' })).toBeVisible()

    const latencyRegion = await hoverChartSurfaceByHeading(page, 'Latency Distribution')
    await expect(
      latencyRegion.locator('.recharts-area, .recharts-area-area, .recharts-area-curve')
    ).toHaveCount(0)

    await gotoWithDarkMode(page, '/metrics')
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible()

    const trendsRegion = await hoverChartSurfaceByHeading(page, 'Embedding Trends')
    await expect(
      trendsRegion.locator('.recharts-area, .recharts-area-area, .recharts-area-curve')
    ).toHaveCount(0)
  })

  test('responsive time axis keeps deterministic intervals for latency distribution', async ({ page }) => {
    await gotoWithDarkMode(page, '/')
    await expect(page.getByRole('heading', { name: 'Server Status' })).toBeVisible()

    const widthsToCheck = [920, 1000, 1400]
    for (const width of widthsToCheck) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.getByRole('heading', { name: 'Server Status' })).toBeVisible()

      const labels = await readXAxisTickLabelsByHeading(page, 'Latency Distribution')
      expect(labels.length).toBeGreaterThanOrEqual(3)
      expect(getIntervalSet(labels).size).toBeLessThanOrEqual(1)
    }
  })

  test('latency distribution initial line animation keeps contiguous dash segments', async ({ page }) => {
    await gotoWithDarkMode(page, '/')
    await expect(page.getByText('Latency Distribution', { exact: true }).first()).toBeVisible()

    const samples = await collectLatencyDashSamples(page, { sampleCount: 22, intervalMs: 25 })
    const animatedLineSamples = samples.flatMap((sample) => sample.lines
      .filter((line) => Number.isFinite(line.progress) && line.progress > 0 && line.progress < 1)
      .map((line) => ({
        ...line,
        t: sample.t,
      })))

    expect(animatedLineSamples.length).toBeGreaterThan(0)

    for (const sample of animatedLineSamples) {
      expect(
        sample.delta,
        `${sample.name} had dash mismatch ${sample.delta.toFixed(3)} at ${sample.t.toFixed(1)}ms`
      ).toBeLessThan(0.5)
    }
  })
})
