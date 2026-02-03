'use client'

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

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
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(60% 0.18 260)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(60% 0.18 260)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'oklch(50% 0.01 240)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'oklch(50% 0.01 240)' }}
            tickFormatter={(value) => `${value}ms`}
            width={45}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
                    <p className="text-sm font-medium">{payload[0].value}ms</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="oklch(60% 0.18 260)"
            strokeWidth={2}
            fill="url(#latencyGradient)"
            activeDot={{
              r: 6,
              fill: 'oklch(60% 0.18 260)',
              stroke: 'white',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
