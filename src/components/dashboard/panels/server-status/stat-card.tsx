'use client'

import { Sparkline } from '@/components/charts/sparkline'
import { MetricSurfaceCard } from '@/components/dashboard/panels/shared/metric-surface-card'
import type { MetricValueAnimationMode } from '@/components/dashboard/panels/shared/animated-metric-value'
import type { Format } from '@number-flow/react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  valueFormat?: Format
  valueSuffix?: string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  sparkline?: number[]
  animationMode?: MetricValueAnimationMode
  className?: string
}

function smoothSparkline(data: number[]) {
  if (data.length < 3) return data

  return data.map((_, index) => {
    const start = Math.max(0, index - 1)
    const end = Math.min(data.length, index + 2)
    const window = data.slice(start, end)
    const sum = window.reduce((total, value) => total + value, 0)
    return sum / window.length
  })
}

export function StatCard({
  title,
  value,
  valueFormat,
  valueSuffix,
  change,
  changeType,
  sparkline,
  animationMode,
  className,
}: StatCardProps) {
  const TrendIcon = changeType === 'increase' ? ArrowUp :
    changeType === 'decrease' ? ArrowDown : Minus

  const trendColor = changeType === 'increase' ? 'text-success' :
    changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'
  const roundedChange = Math.abs(change).toFixed(1)
  const sparklineData = sparkline ? smoothSparkline(sparkline) : undefined

  return (
    <MetricSurfaceCard
      title={title}
      value={value}
      valueFormat={valueFormat}
      valueSuffix={valueSuffix}
      animationMode={animationMode}
      className={cn(className)}
      meta={(
        <span className={cn('flex items-center gap-1 typography-weight-medium', trendColor)}>
          <TrendIcon className="size-(--icon-xs)" />
          <span>{roundedChange}%</span>
        </span>
      )}
      rightContent={sparklineData ? (
        <Sparkline
          data={sparklineData}
          className="h-10 w-20"
          tone={
            changeType === 'increase'
              ? 'success'
              : changeType === 'decrease'
                ? 'error'
                : 'muted'
          }
        />
      ) : undefined}
    />
  )
}
