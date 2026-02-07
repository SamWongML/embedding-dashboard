'use client'

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

export function TrendsChart({ data, className }: TrendsChartProps) {
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    'Text Embeddings': point.textEmbeddings,
    'Image Embeddings': point.imageEmbeddings,
    Searches: point.searches,
  }))

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
                const rows = payload.map((entry) => {
                  const series = trendSeries.find((item) => item.dataKey === entry.dataKey)

                  return {
                    label: String(entry.name),
                    value: (entry.value as number).toLocaleString(),
                    tone: series?.tone ?? 'accent',
                  }
                })

                return (
                  <ChartTooltipContent
                    label={String(label)}
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
              type="monotone"
              dataKey={series.dataKey}
              name={series.label}
              stroke={colorByChartTone(series.tone)}
              strokeWidth={2}
              strokeDasharray={series.strokeDasharray}
              fill={`url(#${series.gradientId})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
