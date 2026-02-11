import type { ReactNode } from 'react'

export type ChartTone =
  | 'accent'        // chart-1 (Blue)
  | 'accentSoft'    // Light blue
  | 'accentDim'     // Dark blue
  | 'teal'          // chart-2
  | 'amber'         // chart-3
  | 'green'         // chart-4
  | 'coral'         // chart-5 (Orange-Red)
  | 'muted'
  | 'success'
  | 'warning'
  | 'error'

export const chartToneToColorVar: Record<ChartTone, string> = {
  accent: 'var(--chart-1)',
  accentSoft: 'var(--chart-accent-soft)',
  accentDim: 'var(--chart-accent-dim)',
  teal: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  green: 'var(--chart-4)',
  coral: 'var(--chart-5)',
  muted: 'var(--chart-axis)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
}

// Direct color values for SVG/Canvas rendering (Recharts compatibility)
// IMPORTANT: These values must stay in sync with globals.css chart variables.
// CSS custom properties don't work reliably in SVG elements rendered by Recharts,
// so we duplicate the values here for direct use in charts.
// Source of truth: src/app/globals.css (--chart-1, --chart-2, --chart-3, etc.)
export const chartColors = {
  light: {
    accent: 'oklch(58% 0.14 250)',      // Blue
    accentSoft: 'oklch(70% 0.08 250)',
    accentDim: 'oklch(48% 0.10 250)',
    teal: 'oklch(60% 0.12 175)',        // Teal
    amber: 'oklch(66% 0.13 80)',        // Amber
    green: 'oklch(58% 0.12 150)',
    coral: 'oklch(63% 0.12 15)',
    muted: 'oklch(52% 0.005 240)',
    success: 'oklch(55% 0.18 155)',
    warning: 'oklch(70% 0.18 80)',
    error: 'oklch(58% 0.22 25)',
  },
  dark: {
    accent: 'oklch(68% 0.14 250)',      // Blue
    accentSoft: 'oklch(78% 0.08 250)',
    accentDim: 'oklch(58% 0.10 250)',
    teal: 'oklch(68% 0.12 175)',        // Teal
    amber: 'oklch(75% 0.13 80)',        // Amber
    green: 'oklch(68% 0.12 155)',
    coral: 'oklch(70% 0.13 20)',
    muted: 'oklch(65% 0.003 240)',
    success: 'oklch(65% 0.18 155)',
    warning: 'oklch(76% 0.16 80)',
    error: 'oklch(68% 0.20 25)',
  },
} as const

export function getChartColor(tone: ChartTone, theme: 'light' | 'dark'): string {
  return chartColors[theme][tone]
}

export function colorByChartTone(tone: ChartTone): string {
  return chartToneToColorVar[tone]
}

export const chartAxisTick = {
  fontSize: 11,
  fill: 'var(--chart-axis)',
}

export const chartAxisDefaults = {
  axisLine: false,
  tickLine: false,
  tick: chartAxisTick,
}

export const chartGridStroke = 'var(--chart-grid)'

export const chartBarRadius: [number, number, number, number] = [0, 6, 6, 0]

export const chartBarFill = 'var(--chart-accent)'

export const chartTooltipCursor = false

export const chartStrokeWidth = { area: 1.5, line: 1.5, sparkline: 1.5 } as const
export const chartFillOpacity = { area: 0.10 } as const
export const chartDotConfig = { default: false, active: { r: 4, strokeWidth: 2 } } as const
export const chartGridConfig = { strokeDasharray: '3 3', horizontal: true, vertical: false } as const

export const chartAnimationDurationMs = 350
export const chartAnimationEasing = 'ease-out'

export interface ChartTooltipRow {
  label: string
  value: ReactNode
  tone?: ChartTone
  color?: string
}

export const graphNodeToneByType = {
  document: 'accent',    // Blue
  topic: 'teal',         // Teal
  'user-group': 'amber', // Amber
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

// Direct graph colors for D3/SVG rendering (CSS variables don't resolve in D3)
export const graphColors = {
  light: {
    link: 'oklch(86% 0.003 240 / 30%)',
    label: 'oklch(52% 0.005 240)',
    nodeStroke: 'oklch(100% 0 0)',
  },
  dark: {
    link: 'oklch(35% 0.005 240 / 25%)',
    label: 'oklch(65% 0.003 240)',
    nodeStroke: 'oklch(10% 0.005 240)',
  },
} as const

export function getGraphColors(theme: 'light' | 'dark') {
  return {
    link: graphColors[theme].link,
    label: graphColors[theme].label,
    nodeStroke: graphColors[theme].nodeStroke,
    nodeColor: (nodeType: string) => getChartColor(
      graphNodeToneByType[nodeType as GraphNodeVisualType] ?? graphNodeToneByType.default,
      theme
    ),
  }
}
