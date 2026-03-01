import type { ReactNode } from 'react'
import { readCssLengthVar, readTypographyPxVar } from '@/lib/design/typography-runtime'

export type ChartTone =
  | 'accent'        // chart-1 (Indigo)
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
  accent: 'var(--chart-accent)',
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
// IMPORTANT: These values must stay in sync with the runtime chart CSS variables.
// CSS custom properties don't work reliably in SVG elements rendered by Recharts,
// so we duplicate the values here for direct use in charts.
// Source of truth: src/app/styles/themes/colors.css (--chart-1, --chart-2, --chart-3, etc.)
export const chartColors = {
  light: {
    accent: 'oklch(55% 0.14 277)',      // Indigo
    accentSoft: 'oklch(70% 0.08 277)',
    accentDim: 'oklch(48% 0.10 277)',
    teal: 'oklch(52.08% .1251 182.93)', // Teal 900
    amber: 'oklch(52.79% .1496 54.65)', // Amber 900
    green: 'oklch(58% 0.12 150)',
    coral: 'oklch(63% 0.12 15)',
    muted: 'oklch(52% 0.005 260)',
    success: 'oklch(55% 0.18 155)',
    warning: 'oklch(70% 0.18 80)',
    error: 'oklch(58% 0.22 25)',
  },
  dark: {
    accent: 'oklch(68% 0.14 277)',      // Indigo
    accentSoft: 'oklch(78% 0.08 277)',
    accentDim: 'oklch(58% 0.10 277)',
    teal: 'oklch(74.56% .1765 182.8)',  // Teal 900
    amber: 'oklch(77.21% .1991 64.28)', // Amber 900
    green: 'oklch(68% 0.12 155)',
    coral: 'oklch(70% 0.13 20)',
    muted: 'oklch(60% 0.008 270)',
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

type ChartMargin = {
  top: number
  right: number
  bottom: number
  left: number
}

type ChartMarginTokenSet = {
  top: `--${string}`
  right: `--${string}`
  bottom: `--${string}`
  left: `--${string}`
}

function resolveChartMargin(tokens: ChartMarginTokenSet, fallback: ChartMargin): ChartMargin {
  return {
    top: readCssLengthVar(tokens.top, fallback.top),
    right: readCssLengthVar(tokens.right, fallback.right),
    bottom: readCssLengthVar(tokens.bottom, fallback.bottom),
    left: readCssLengthVar(tokens.left, fallback.left),
  }
}

export const chartContainerHeights = {
  compact: 'h-(--chart-height-compact)',
  standard: 'h-(--chart-height-standard)',
  tall: 'h-(--chart-height-tall)',
} as const

export const chartMargins = {
  lineDefault: resolveChartMargin(
    {
      top: '--chart-margin-line-top',
      right: '--chart-margin-line-right',
      bottom: '--chart-margin-line-bottom',
      left: '--chart-margin-line-left',
    },
    { top: 10, right: 10, bottom: 0, left: 0 }
  ),
  lineWideRight: {
    ...resolveChartMargin(
      {
        top: '--chart-margin-line-top',
        right: '--chart-margin-line-right',
        bottom: '--chart-margin-line-bottom',
        left: '--chart-margin-line-left',
      },
      { top: 10, right: 10, bottom: 0, left: 0 }
    ),
    right: readCssLengthVar('--chart-margin-line-wide-right', 20),
  },
  barDefault: resolveChartMargin(
    {
      top: '--chart-margin-bar-top',
      right: '--chart-margin-bar-right',
      bottom: '--chart-margin-bar-bottom',
      left: '--chart-margin-bar-left',
    },
    { top: 10, right: 10, bottom: 0, left: 0 }
  ),
  barTightTop: {
    ...resolveChartMargin(
      {
        top: '--chart-margin-bar-top',
        right: '--chart-margin-bar-right',
        bottom: '--chart-margin-bar-bottom',
        left: '--chart-margin-bar-left',
      },
      { top: 10, right: 10, bottom: 0, left: 0 }
    ),
    top: readCssLengthVar('--chart-margin-bar-tight-top', 0),
  },
  composedDefault: resolveChartMargin(
    {
      top: '--chart-margin-composed-top',
      right: '--chart-margin-composed-right',
      bottom: '--chart-margin-composed-bottom',
      left: '--chart-margin-composed-left',
    },
    { top: 10, right: 8, bottom: 0, left: 0 }
  ),
} as const

type ChartLegendPreset = {
  verticalAlign: 'top' | 'middle' | 'bottom'
  align?: 'left' | 'center' | 'right'
  height: number
  iconType: 'circle'
  iconSize: number
}

export const chartLegendPresets = {
  compactRight: {
    verticalAlign: 'top',
    align: 'right',
    height: readCssLengthVar('--chart-legend-height-compact', 24),
    iconType: 'circle',
    iconSize: readCssLengthVar('--chart-legend-icon-size-compact', 6),
  },
  defaultRight: {
    verticalAlign: 'top',
    align: 'right',
    height: readCssLengthVar('--chart-legend-height-default', 24),
    iconType: 'circle',
    iconSize: readCssLengthVar('--chart-legend-icon-size-default', 7),
  },
  roomyTop: {
    verticalAlign: 'top',
    height: readCssLengthVar('--chart-legend-height-roomy', 36),
    iconType: 'circle',
    iconSize: readCssLengthVar('--chart-legend-icon-size-compact', 6),
  },
} as const satisfies Record<string, ChartLegendPreset>

export const chartLegendLabelClassName = 'typography-copy-13 text-muted-foreground'

export const chartTooltipLayout = {
  paddingX: readCssLengthVar('--chart-tooltip-padding-x', 10),
  paddingY: readCssLengthVar('--chart-tooltip-padding-y', 8),
  rowGap: readCssLengthVar('--chart-tooltip-row-gap', 6),
  indicatorSize: readCssLengthVar('--chart-tooltip-indicator-size', 6),
} as const

export const chartAxisTick = {
  fontSize: readTypographyPxVar('--chart-axis-tick-size', 11),
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
export const chartLineType = 'monotoneX' as const
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

export function getGraphLabelFontSizePx() {
  return readTypographyPxVar('--graph-label-size', 10)
}

// Direct graph colors for D3/SVG rendering (CSS variables don't resolve in D3)
export const graphColors = {
  light: {
    link: 'oklch(86% 0.003 260 / 30%)',
    label: 'oklch(52% 0.005 260)',
    nodeStroke: 'oklch(100% 0 0)',
  },
  dark: {
    link: 'oklch(100% 0 0 / 0.06)',
    label: 'oklch(60% 0.008 270)',
    nodeStroke: 'oklch(9% 0.003 265)',
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
