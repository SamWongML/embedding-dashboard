'use client'

import { useEffect, useId, useMemo } from 'react'
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
  colorByChartTone,
} from './chart-theme'

interface TrendsChartProps {
  data: EmbeddingTrend[]
  className?: string
}

const trendSeries = [
  {
    dataKey: 'Text Embeddings',
    label: 'Text Embeddings (solid)',
    tone: 'accent',
    gradientId: 'trendTextGradient',
    strokeDasharray: undefined,
    fillOpacity: 0.22,
  },
  {
    dataKey: 'Image Embeddings',
    label: 'Image Embeddings (dashed)',
    tone: 'accentSoft',
    gradientId: 'trendImageGradient',
    strokeDasharray: '6 4',
    fillOpacity: 0.14,
  },
  {
    dataKey: 'Searches',
    label: 'Searches (dotted)',
    tone: 'accentDim',
    gradientId: 'trendSearchGradient',
    strokeDasharray: '2 4',
    fillOpacity: 0.1,
  },
] as const

const previousPointCountByChartId = new Map<string, number>()

export function TrendsChart({ data, className }: TrendsChartProps) {
  const chartData = useMemo(() => normalizeEmbeddingTrends(data), [data])
  const chartId = useId()
  const previousPointCount = previousPointCountByChartId.get(chartId)
  const shouldAnimate =
    previousPointCount === undefined ||
    previousPointCount === chartData.length

  useEffect(() => {
    previousPointCountByChartId.set(chartId, chartData.length)

    return () => {
      previousPointCountByChartId.delete(chartId)
    }
  }, [chartId, chartData.length])

  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {trendSeries.map((series) => {
              const color = colorByChartTone(series.tone)

              return (
                <linearGradient key={series.gradientId} id={series.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={series.fillOpacity} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
          <CartesianGrid stroke={chartGridStroke} vertical={false} />
          <XAxis
            dataKey="date"
            {...chartAxisDefaults}
            interval="preserveStartEnd"
            tickFormatter={(value) => formatTrendDateLabel(String(value))}
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
                      tone: series.tone,
                    },
                  ]
                })

                if (!rows.length) return null

                return (
                  <ChartTooltipContent
                    label={label ? formatTrendDateLabel(String(label)) : undefined}
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
              stroke={colorByChartTone(series.tone)}
              strokeWidth={2}
              strokeDasharray={series.strokeDasharray}
              fill={`url(#${series.gradientId})`}
              isAnimationActive={shouldAnimate}
              animationDuration={chartAnimationDurationMs}
              animationEasing={chartAnimationEasing}
              activeDot={{
                r: 5,
                fill: 'var(--card)',
                stroke: colorByChartTone(series.tone),
                strokeWidth: 2,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
