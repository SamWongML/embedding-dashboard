'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { TopHit } from '@/lib/schemas/metrics'
import { ChartTooltipContent } from './chart-tooltip-content'
import {
  buildAccentTonalSeries,
  chartActiveBarStyle,
  chartAxisDefaults,
  chartBarRadius,
  chartGridStroke,
  chartTooltipCursor,
} from './chart-theme'

interface TopHitsChartProps {
  data: TopHit[]
  className?: string
}

export function TopHitsChart({ data, className }: TopHitsChartProps) {
  const tonalSeries = buildAccentTonalSeries(data.length)

  return (
    <div className={cn('w-full h-[200px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={chartGridStroke} vertical={false} />
          <XAxis
            type="number"
            {...chartAxisDefaults}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            {...chartAxisDefaults}
            width={120}
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const datum = payload[0]?.payload as TopHit | undefined
                if (!datum) return null

                return (
                  <ChartTooltipContent
                    label={datum.name}
                    rows={[
                      {
                        label: 'Hits',
                        value: datum.count.toLocaleString(),
                      },
                      {
                        label: 'Type',
                        value: datum.type,
                        tone: 'accentSoft',
                      },
                    ]}
                  />
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="count"
            radius={chartBarRadius}
            activeBar={chartActiveBarStyle}
            background={{ fill: 'var(--chart-track)', radius: 6 }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={tonalSeries[index] ?? tonalSeries[0]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
