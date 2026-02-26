'use client'

import { MetricSurfaceCard } from '@/components/dashboard/panels/shared/metric-surface-card'
import type { MetricValueAnimationMode } from '@/components/dashboard/panels/shared/animated-metric-value'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  valueSuffix?: string
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  animationMode?: MetricValueAnimationMode
  className?: string
}

export function StatCard({
  title,
  value,
  valueSuffix,
  subtitle,
  icon,
  trend,
  animationMode = 'on-mount',
  className,
}: StatCardProps) {
  return (
    <MetricSurfaceCard
      title={title}
      value={value}
      valueSuffix={valueSuffix}
      icon={icon}
      animationMode={animationMode}
      className={cn(className)}
      valueAdornment={trend ? (
        <span
          className={cn(
            'typography-weight-medium',
            trend.isPositive ? 'text-success' : 'text-error'
          )}
        >
          {trend.isPositive ? '+' : ''}
          {trend.value}%
        </span>
      ) : undefined}
      meta={subtitle ? <span>{subtitle}</span> : undefined}
    />
  )
}
