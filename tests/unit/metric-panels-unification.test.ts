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

  it('uses tokenized adaptive metric grid contracts in overview sections', () => {
    const metricsPanelSource = load('src/components/dashboard/panels/metrics/metrics-panel.tsx')
    const serverPanelSource = load('src/components/dashboard/panels/server-status/server-status-panel.tsx')
    const workspacePanelSource = load('src/components/dashboard/panels/workspace/workspace-panel.tsx')

    const sources = [metricsPanelSource, serverPanelSource, workspacePanelSource]
    const gridContract = [
      'grid auto-rows-fr',
      'gap-(--metric-card-grid-gap)',
      'repeat(auto-fit,minmax(var(--metric-card-grid-min-width),1fr))',
    ]

    sources.forEach((source) => {
      gridContract.forEach((contractSnippet) => {
        expect(source).toContain(contractSnippet)
      })
      expect(source).toContain('space-y-(--metric-card-section-gap)')
    })
  })

  it('wires the agreed animation policy by panel', () => {
    const metricsPanelSource = load('src/components/dashboard/panels/metrics/metrics-panel.tsx')
    const serverPanelSource = load('src/components/dashboard/panels/server-status/server-status-panel.tsx')
    const workspacePanelSource = load('src/components/dashboard/panels/workspace/workspace-panel.tsx')

    expect(metricsPanelSource).toContain('animationMode="always"')
    expect(serverPanelSource).toContain('animationMode="on-mount"')
    expect(workspacePanelSource).toContain('animationMode="on-mount"')
  })
})
