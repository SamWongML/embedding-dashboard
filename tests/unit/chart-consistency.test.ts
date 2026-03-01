import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()
const chartFiles = [
  'latency-distribution-chart.tsx',
  'service-usage-chart.tsx',
  'top-hits-chart.tsx',
  'throughput-errors-chart.tsx',
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

  it('uses centralized chart heights and margin presets', () => {
    const chartsWithContainerHeights = [
      'latency-distribution-chart.tsx',
      'service-usage-chart.tsx',
      'top-hits-chart.tsx',
      'throughput-errors-chart.tsx',
      'latency-chart.tsx',
      'trends-chart.tsx',
    ] as const

    chartsWithContainerHeights.forEach((fileName) => {
      const source = loadChartFile(fileName)
      expect(source).toContain('chartContainerHeights')
    })

    chartFiles.forEach((fileName) => {
      const source = loadChartFile(fileName)
      expect(source).not.toContain('margin={{')
    })
  })

  it('uses centralized legend presets and typography tokens', () => {
    const legendCharts = [
      'latency-distribution-chart.tsx',
      'latency-chart.tsx',
      'throughput-errors-chart.tsx',
      'trends-chart.tsx',
    ] as const

    legendCharts.forEach((fileName) => {
      const source = loadChartFile(fileName)
      expect(source).toContain('chartLegendPresets')
      expect(source).toContain('chartLegendLabelClassName')
    })
  })

  it('keeps line-chart legends aligned to the right', () => {
    const rightLegendLineCharts = [
      'latency-distribution-chart.tsx',
      'latency-chart.tsx',
      'trends-chart.tsx',
    ] as const

    rightLegendLineCharts.forEach((fileName) => {
      const source = loadChartFile(fileName)
      expect(source).toContain('chartLegendPresets.defaultRight')
      expect(source).not.toContain('chartLegendPresets.roomyTop')
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
    expect(trendsSource).toContain('type={chartLineType}')
    expect(trendsSource).toContain('isAnimationActive={true}')
    expect(trendsSource).toContain('activeDot={{')
  })

  it('renders primary time-series charts as line-only without area gradients', () => {
    const latencyDistributionSource = loadChartFile('latency-distribution-chart.tsx')
    const latencySource = loadChartFile('latency-chart.tsx')
    const trendsSource = loadChartFile('trends-chart.tsx')

    expect(latencyDistributionSource).toContain('<LineChart')
    expect(latencyDistributionSource).toContain('<Line')
    expect(latencyDistributionSource).not.toContain('<AreaChart')
    expect(latencyDistributionSource).not.toContain('<Area')
    expect(latencyDistributionSource).not.toContain('fill="url(#')

    expect(latencySource).toContain('<LineChart')
    expect(latencySource).toContain('<Line')
    expect(latencySource).not.toContain('<AreaChart')
    expect(latencySource).not.toContain('<Area')
    expect(latencySource).not.toContain('latencyGradient')
    expect(latencySource).not.toContain('fill="url(#')

    expect(trendsSource).toContain('<LineChart')
    expect(trendsSource).toContain('<Line')
    expect(trendsSource).not.toContain('<AreaChart')
    expect(trendsSource).not.toContain('<Area')
    expect(trendsSource).not.toContain('gradientId')
    expect(trendsSource).not.toContain('fill="url(#')
  })
  it('uses dynamic axis formatters in primary line charts', () => {
    const latencyDistributionSource = loadChartFile('latency-distribution-chart.tsx')
    const latencySource = loadChartFile('latency-chart.tsx')
    const trendsSource = loadChartFile('trends-chart.tsx')

    expect(trendsSource).toContain('buildCountAxisFormatter')
    expect(trendsSource).toContain('buildTimeTickFormatter')
    expect(trendsSource).toContain('buildUtcHourMinuteTickFormatter')
    expect(trendsSource).toContain('buildDeterministicUtcTimeTicks')
    expect(trendsSource).not.toContain('tickCount={6}')
    expect(trendsSource).not.toContain('value / 1000')

    expect(latencyDistributionSource).toContain('buildDurationAxisFormatter')
    expect(latencyDistributionSource).toContain('buildUtcHourMinuteTickFormatter')
    expect(latencyDistributionSource).toContain('buildDeterministicUtcHourTicks')
    expect(latencyDistributionSource).not.toContain('`${value}ms`')
    expect(latencyDistributionSource).not.toContain('tickCount={6}')

    expect(latencySource).toContain('buildDurationAxisFormatter')
    expect(latencySource).toContain('buildTimeTickFormatter')
    expect(latencySource).not.toContain('`${value}ms`')
    expect(latencySource).not.toContain('toLocaleTimeString')
  })
})
