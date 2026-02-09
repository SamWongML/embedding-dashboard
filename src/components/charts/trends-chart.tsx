'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { EmbeddingTrend } from '@/lib/schemas/metrics'
import { useTheme } from '@/components/providers/theme-provider'
import { ChartTooltipContent } from './chart-tooltip-content'
import {
  formatTrendDateLabel,
  normalizeEmbeddingTrends,
} from './trends-chart-utils'
import {
  chartAnimationDurationMs,
  chartAnimationEasing,
  chartAxisDefaults,
  chartGridStroke,
  chartTooltipCursor,
  getChartColor,
  type ChartTone,
} from './chart-theme'

interface TrendsChartProps {
  data: EmbeddingTrend[]
  className?: string
  period?: '24h' | '7d' | '30d'
}

const trendSeriesConfig = [
  {
    dataKey: 'Text Embeddings',
    label: 'Text Embeddings',
    tone: 'accent' as ChartTone,      // Blue (chart-1)
    gradientId: 'trendTextGradient',
    fillOpacity: 0.24,
  },
  {
    dataKey: 'Image Embeddings',
    label: 'Image Embeddings',
    tone: 'teal' as ChartTone,        // Teal (chart-2)
    gradientId: 'trendImageGradient',
    fillOpacity: 0.20,
  },
  {
    dataKey: 'Searches',
    label: 'Searches',
    tone: 'amber' as ChartTone,       // Amber (chart-3)
    gradientId: 'trendSearchGradient',
    fillOpacity: 0.18,
  },
] as const

export function TrendsChart({ data, className, period }: TrendsChartProps) {
  const chartData = useMemo(() => normalizeEmbeddingTrends(data), [data])
  const { resolvedTheme } = useTheme()

  // Get resolved colors for SVG rendering
  const trendSeries = useMemo(() => {
    return trendSeriesConfig.map((series) => ({
      ...series,
      color: getChartColor(series.tone, resolvedTheme),
    }))
  }, [resolvedTheme])

  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {trendSeries.map((series) => (
              <linearGradient key={series.gradientId} id={series.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={series.color} stopOpacity={series.fillOpacity} />
                <stop offset="95%" stopColor={series.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={chartGridStroke} vertical={false} />
          <XAxis
            dataKey="date"
            {...chartAxisDefaults}
            interval={period === '24h' ? 2 : 'preserveStartEnd'}
            tickFormatter={(value) => formatTrendDateLabel(String(value), 'en-US', period)}
          />
          <YAxis
            {...chartAxisDefaults}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const payloadByDataKey = new Map(
                  payload.map((entry) => [String(entry.dataKey), entry])
                )

                const rows = trendSeries.flatMap((series) => {
                  const entry = payloadByDataKey.get(series.dataKey)
                  const value = Number(entry?.value)

                  if (!entry || !Number.isFinite(value)) {
                    return []
                  }

                  return [
                    {
                      label: series.label,
                      value: value.toLocaleString(),
                      color: series.color,
                    },
                  ]
                })

                if (!rows.length) return null

                return (
                  <ChartTooltipContent
                    label={label ? formatTrendDateLabel(String(label), 'en-US', period) : undefined}
                    rows={rows}
                  />
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
          {trendSeries.map((series) => (
            <Area
              key={series.dataKey}
              type="monotoneX"
              dataKey={series.dataKey}
              name={series.label}
              stroke={series.color}
              strokeWidth={2.5}
              fill={`url(#${series.gradientId})`}
              isAnimationActive={true}
              animationDuration={chartAnimationDurationMs}
              animationEasing={chartAnimationEasing}
              activeDot={{
                r: 5,
                fill: 'var(--card)',
                stroke: series.color,
                strokeWidth: 2,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
