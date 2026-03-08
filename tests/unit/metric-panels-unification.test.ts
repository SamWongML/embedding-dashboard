import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()

function load(relativePath: string) {
  return readFileSync(join(projectRoot, relativePath), 'utf8')
}

describe('metric panel unification', () => {
  it('uses the shared metric surface card primitive across scoped implementations', () => {
    const metricCardSource = load('src/components/dashboard/panels/metrics/metric-card.tsx')
    const statCardSource = load('src/components/dashboard/panels/server-status/stat-card.tsx')
    const overviewCardSource = load('src/components/dashboard/panels/workspace/overview-metric-card.tsx')

    expect(metricCardSource).toContain('MetricSurfaceCard')
    expect(statCardSource).toContain('MetricSurfaceCard')
    expect(overviewCardSource).toContain('MetricSurfaceCard')
  })

  it('uses shared monitoring metric loading primitives and tokenized grid contracts', () => {
    const metricsPanelSource = load('src/components/dashboard/panels/metrics/metrics-panel.tsx')
    const serverPanelSource = load('src/components/dashboard/panels/server-status/server-status-panel.tsx')
    const monitoringLoadingSource = load(
      'src/components/dashboard/panels/shared/monitoring-metric-cards-loading.tsx'
    )
    const workspacePanelSource = load('src/components/dashboard/panels/workspace/workspace-panel.tsx')

    expect(metricsPanelSource).toContain('MonitoringMetricCardsGrid')
    expect(metricsPanelSource).toContain('MonitoringMetricCardsSkeleton')
    expect(serverPanelSource).toContain('MonitoringMetricCardsGrid')
    expect(serverPanelSource).toContain('MonitoringMetricCardsSkeleton')

    const sectionSources = [metricsPanelSource, serverPanelSource, workspacePanelSource]
    const gridContract = [
      'grid auto-rows-fr',
      'gap-(--metric-card-grid-gap)',
      'repeat(auto-fit,minmax(var(--metric-card-grid-min-width),1fr))',
    ]

    gridContract.forEach((contractSnippet) => {
      expect(monitoringLoadingSource).toContain(contractSnippet)
      expect(workspacePanelSource).toContain(contractSnippet)
    })

    sectionSources.forEach((source) => {
      expect(source).toContain('space-y-(--metric-card-section-gap)')
    })
  })

  it('wires the agreed animation policy by panel', () => {
    const metricSurfaceCardSource = load(
      'src/components/dashboard/panels/shared/metric-surface-card.tsx'
    )
    const metricsPanelSource = load('src/components/dashboard/panels/metrics/metrics-panel.tsx')
    const serverPanelSource = load('src/components/dashboard/panels/server-status/server-status-panel.tsx')
    const metricCardSource = load('src/components/dashboard/panels/metrics/metric-card.tsx')
    const statCardSource = load('src/components/dashboard/panels/server-status/stat-card.tsx')
    const overviewCardSource = load('src/components/dashboard/panels/workspace/overview-metric-card.tsx')
    const workspacePanelSource = load('src/components/dashboard/panels/workspace/workspace-panel.tsx')

    expect(metricSurfaceCardSource).toContain("animationMode = 'always'")

    ;[metricCardSource, statCardSource, overviewCardSource].forEach((source) => {
      expect(source).not.toContain("animationMode = 'on-mount'")
    })

    ;[metricsPanelSource, serverPanelSource, workspacePanelSource].forEach((source) => {
      expect(source).not.toContain('animationMode=')
    })
  })
})
