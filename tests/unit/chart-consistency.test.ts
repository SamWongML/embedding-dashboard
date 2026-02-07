import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()
const chartFiles = [
  'service-usage-chart.tsx',
  'top-hits-chart.tsx',
  'latency-chart.tsx',
  'trends-chart.tsx',
  'sparkline.tsx',
] as const

function loadChartFile(fileName: (typeof chartFiles)[number]) {
  return readFileSync(join(projectRoot, 'src/components/charts', fileName), 'utf8')
}

describe('chart consistency', () => {
  it('all chart components import shared chart theme primitives', () => {
    chartFiles.forEach((fileName) => {
      const source = loadChartFile(fileName)
      expect(source).toContain("from './chart-theme'")
    })
  })

  it('does not duplicate legacy inline tooltip card markup', () => {
    const legacyTooltipClass = 'bg-popover border border-border rounded-md px-3 py-2 shadow-lg'

    chartFiles.forEach((fileName) => {
      const source = loadChartFile(fileName)
      expect(source).not.toContain(legacyTooltipClass)
    })
  })

  it('uses single-accent ranking bars without active overlays', () => {
    const rankingCharts = ['top-hits-chart.tsx', 'service-usage-chart.tsx'] as const

    rankingCharts.forEach((fileName) => {
      const source = loadChartFile(fileName)

      expect(source).toContain('fill={chartBarFill}')
      expect(source).toContain('activeBar={false}')
      expect(source).not.toContain('<Cell')
      expect(source).not.toContain('buildAccentTonalSeries')
    })
  })

  it('normalizes trend points before rendering and uses deterministic animation props', () => {
    const trendsSource = loadChartFile('trends-chart.tsx')

    expect(trendsSource).toContain('normalizeEmbeddingTrends')
    expect(trendsSource).toContain('type="monotoneX"')
    expect(trendsSource).toContain('isAnimationActive={shouldAnimate}')
    expect(trendsSource).toContain('activeDot={{')
  })
})
