'use client'

import * as React from 'react'
import type { Format } from '@number-flow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AnimatedMetricValue,
  type MetricValueAnimationMode,
} from '@/components/dashboard/panels/shared/animated-metric-value'

export interface MetricSurfaceCardProps {
  title: string
  value?: number | string
  valueDisplay?: React.ReactNode
  valueFormat?: Format
  valueSuffix?: string
  valueAdornment?: React.ReactNode
  meta?: React.ReactNode
  icon?: React.ReactNode
  rightContent?: React.ReactNode
  animationMode?: MetricValueAnimationMode
  animationDelayMs?: number
  className?: string
  titleClassName?: string
  contentClassName?: string
  valueClassName?: string
  metaClassName?: string
}

export function MetricSurfaceCard({
  title,
  value,
  valueDisplay,
  valueFormat,
  valueSuffix,
  valueAdornment,
  meta,
  icon,
  rightContent,
  animationMode = 'on-mount',
  animationDelayMs = 0,
  className,
  titleClassName,
  contentClassName,
  valueClassName,
  metaClassName,
}: MetricSurfaceCardProps) {
  return (
    <Card className={cn('h-full min-h-[var(--metric-card-min-height)]', className)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle
          className={cn(
            '[font-size:var(--metric-card-title-size)] typography-weight-medium text-muted-foreground',
            titleClassName
          )}
        >
          {title}
        </CardTitle>
        {icon ? (
          <div className="text-muted-foreground [&_svg]:size-(--metric-card-icon-size)">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn(
          'flex flex-1 items-center justify-between gap-(--metric-card-gap)',
          contentClassName
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-baseline gap-2">
            {valueDisplay ?? (
              <AnimatedMetricValue
                value={value ?? ''}
                format={valueFormat}
                suffix={valueSuffix}
                animationMode={animationMode}
                delayMs={animationDelayMs}
                className={cn(
                  '[font-size:var(--metric-card-value-size)] [line-height:var(--metric-card-value-line-height)] typography-weight-bold',
                  valueClassName
                )}
              />
            )}
            {valueAdornment ? (
              <span className="[font-size:var(--metric-card-meta-size)] typography-weight-medium">
                {valueAdornment}
              </span>
            ) : null}
          </div>
          {meta ? (
            <div
              className={cn(
                '[font-size:var(--metric-card-meta-size)] text-muted-foreground',
                metaClassName
              )}
            >
              {meta}
            </div>
          ) : null}
        </div>
        {rightContent ? (
          <div className="shrink-0 self-center">
            {rightContent}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
