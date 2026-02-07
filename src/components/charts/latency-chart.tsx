'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from './chart-tooltip-content'
import {
  chartAxisDefaults,
  chartGridStroke,
  chartTooltipCursor,
} from './chart-theme'

interface LatencyChartProps {
  data: Array<{ timestamp: string; value: number }>
  className?: string
}

export function LatencyChart({ data, className }: LatencyChartProps) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    latency: point.value,
  }))

  return (
    <div className={cn('w-full h-[200px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-accent)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--chart-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartGridStroke} vertical={false} />
          <XAxis
            dataKey="time"
            {...chartAxisDefaults}
            interval="preserveStartEnd"
          />
          <YAxis
            {...chartAxisDefaults}
            tickFormatter={(value) => `${value}ms`}
            width={45}
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const datum = payload[0]?.payload as { time: string } | undefined
                if (!datum) return null

                return (
                  <ChartTooltipContent
                    label={datum.time}
                    rows={[
                      {
                        label: 'Latency',
                        value: `${payload[0].value}ms`,
                      },
                    ]}
                  />
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="var(--chart-accent)"
            strokeWidth={2}
            fill="url(#latencyGradient)"
            activeDot={{
              r: 6,
              fill: 'var(--chart-accent)',
              stroke: 'var(--card)',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
