import type { ReactNode } from 'react'

export type ChartTone =
  | 'accent'
  | 'accentSoft'
  | 'accentDim'
  | 'muted'
  | 'success'
  | 'warning'
  | 'error'

export const chartToneToColorVar: Record<ChartTone, string> = {
  accent: 'var(--chart-accent)',
  accentSoft: 'var(--chart-accent-soft)',
  accentDim: 'var(--chart-accent-dim)',
  muted: 'var(--chart-axis)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
}

export function colorByChartTone(tone: ChartTone): string {
  return chartToneToColorVar[tone]
}

const accentToneSeries: readonly ChartTone[] = [
  'accent',
  'accentSoft',
  'accentDim',
  'accentSoft',
  'accentDim',
]

export function buildAccentTonalSeries(length: number): string[] {
  if (length <= 0) return []

  return Array.from({ length }, (_, index) =>
    colorByChartTone(accentToneSeries[index % accentToneSeries.length] ?? 'accent')
  )
}

export const chartAxisTick = {
  fontSize: 10,
  fill: 'var(--chart-axis)',
}

export const chartAxisDefaults = {
  axisLine: false,
  tickLine: false,
  tick: chartAxisTick,
}

export const chartGridStroke = 'var(--chart-grid)'

export const chartBarRadius: [number, number, number, number] = [0, 6, 6, 0]

export const chartActiveBarStyle = {
  stroke: 'var(--chart-accent-soft)',
  strokeWidth: 1,
  fillOpacity: 0.95,
}

export const chartTooltipCursor = false

export interface ChartTooltipRow {
  label: string
  value: ReactNode
  tone?: ChartTone
  color?: string
}

export const graphNodeToneByType = {
  document: 'accent',
  topic: 'accentSoft',
  'user-group': 'accentDim',
  default: 'muted',
} as const satisfies Record<string, ChartTone>

export type GraphNodeVisualType = keyof typeof graphNodeToneByType

export const graphNodeColorByType: Record<GraphNodeVisualType, string> = {
  document: colorByChartTone(graphNodeToneByType.document),
  topic: colorByChartTone(graphNodeToneByType.topic),
  'user-group': colorByChartTone(graphNodeToneByType['user-group']),
  default: colorByChartTone(graphNodeToneByType.default),
}

export function colorByGraphNodeType(nodeType: string): string {
  return graphNodeColorByType[nodeType as GraphNodeVisualType] ?? graphNodeColorByType.default
}

export const graphLinkColor = 'var(--chart-grid)'
export const graphLabelColor = 'var(--chart-axis)'
export const graphNodeStrokeColor = 'var(--background)'
