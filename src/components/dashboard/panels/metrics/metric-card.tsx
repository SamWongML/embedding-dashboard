'use client'

import { Sparkline } from '@/components/charts/sparkline'
import { MetricSurfaceCard } from '@/components/dashboard/panels/shared/metric-surface-card'
import type { MetricValueAnimationMode } from '@/components/dashboard/panels/shared/animated-metric-value'
import type { Format } from '@number-flow/react'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { MetricCard as MetricCardType } from '@/lib/schemas/metrics'

interface MetricCardProps {
  metric: MetricCardType
  className?: string
  animationMode?: MetricValueAnimationMode
}

function resolveMetricValue(value: number): {
  value: number
  suffix?: string
  format?: Format
} {
  if (value >= 1_000_000) {
    return {
      value: value / 1_000_000,
      suffix: 'M',
      format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    }
  }

  if (value >= 1_000) {
    return {
      value: value / 1_000,
      suffix: 'K',
      format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    }
  }

  return {
    value,
    format: { maximumFractionDigits: 0 },
  }
}

export function MetricCard({
  metric,
  className,
  animationMode = 'on-mount',
}: MetricCardProps) {
  const formattedValue = resolveMetricValue(metric.value)

  const TrendIcon = metric.changeType === 'increase' ? ArrowUp :
    metric.changeType === 'decrease' ? ArrowDown : Minus

  const trendColor = metric.changeType === 'increase' ? 'text-success' :
    metric.changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'

  return (
    <MetricSurfaceCard
      title={metric.label}
      value={formattedValue.value}
      valueFormat={formattedValue.format}
      valueSuffix={formattedValue.suffix}
      animationMode={animationMode}
      className={cn(className)}
      meta={(
        <span className={cn('flex items-center gap-1 typography-weight-medium', trendColor)}>
          <TrendIcon className="size-(--icon-xs)" />
          <span>{Math.abs(metric.change)}%</span>
        </span>
      )}
      rightContent={metric.sparkline ? (
        <Sparkline
          data={metric.sparkline}
          className="h-10 w-20"
          tone={
            metric.changeType === 'increase'
              ? 'success'
              : metric.changeType === 'decrease'
                ? 'error'
                : 'muted'
          }
        />
      ) : undefined}
    />
  )
}
