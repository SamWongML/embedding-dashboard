'use client'

import * as React from 'react'
import {
  MetricSurfaceCard,
} from '@/components/dashboard/panels/shared/metric-surface-card'
import type { MetricValueAnimationMode } from '@/components/dashboard/panels/shared/animated-metric-value'

interface OverviewMetricCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  valueSuffix?: string
  animationMode?: MetricValueAnimationMode
  className?: string
}

export function OverviewMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  valueSuffix,
  animationMode,
  className,
}: OverviewMetricCardProps) {
  return (
    <MetricSurfaceCard
      title={title}
      value={value}
      valueSuffix={valueSuffix}
      icon={<Icon />}
      meta={<span>{subtitle}</span>}
      animationMode={animationMode}
      className={className}
      titleClassName="typography-size-xs typography-weight-medium uppercase tracking-wider text-muted-foreground"
    />
  )
}
