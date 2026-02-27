'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MonitoringMetricCardsGridProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
}

export function MonitoringMetricCardsGrid({
  className,
  children,
  ...props
}: MonitoringMetricCardsGridProps) {
  return (
    <div
      className={cn(
        'grid auto-rows-fr gap-(--metric-card-grid-gap) [grid-template-columns:repeat(auto-fit,minmax(var(--metric-card-grid-min-width),1fr))]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface MonitoringMetricCardSkeletonProps {
  className?: string
  showSparkline?: boolean
}

export function MonitoringMetricCardSkeleton({
  className,
  showSparkline = true,
}: MonitoringMetricCardSkeletonProps) {
  return (
    <Card
      className={cn(
        'h-full min-h-[var(--metric-card-min-height)] [--card-padding:var(--metric-card-padding)]',
        className
      )}
    >
      <CardHeader className="pb-(--metric-card-header-padding-bottom)">
        <Skeleton aria-hidden className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-between gap-(--metric-card-gap)">
        <div className="flex min-w-0 flex-1 flex-col gap-(--space-xs)">
          <Skeleton aria-hidden className="h-8 w-20" />
          <Skeleton aria-hidden className="h-3 w-16" />
        </div>
        {showSparkline ? (
          <Skeleton aria-hidden className="h-10 w-20 shrink-0" />
        ) : null}
      </CardContent>
    </Card>
  )
}

interface MonitoringMetricCardsSkeletonProps {
  count?: number
  className?: string
  cardClassName?: string
  showSparkline?: boolean
}

export function MonitoringMetricCardsSkeleton({
  count = 4,
  className,
  cardClassName,
  showSparkline = true,
}: MonitoringMetricCardsSkeletonProps) {
  return (
    <MonitoringMetricCardsGrid className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <MonitoringMetricCardSkeleton
          key={index}
          className={cardClassName}
          showSparkline={showSparkline}
        />
      ))}
    </MonitoringMetricCardsGrid>
  )
}
