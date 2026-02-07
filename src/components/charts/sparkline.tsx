'use client'

import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { colorByChartTone } from './chart-theme'
import type { ChartTone } from './chart-theme'

interface SparklineProps {
  data: number[]
  color?: string
  tone?: ChartTone
  className?: string
}

export function Sparkline({ data, color, tone = 'accent', className }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }))
  const strokeColor = color ?? colorByChartTone(tone)

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
