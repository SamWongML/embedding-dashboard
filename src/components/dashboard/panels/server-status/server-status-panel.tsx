'use client'

import { Suspense, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './stat-card'
import { TracesPanel } from './traces-panel'
import { LatencyDistributionChart } from '@/components/charts/latency-distribution-chart'
import { ThroughputErrorsChart } from '@/components/charts/throughput-errors-chart'
import {
  MonitoringMetricCardsGrid,
  MonitoringMetricCardsSkeleton,
} from '@/components/dashboard/panels/shared/monitoring-metric-cards-loading'
import {
  useServerHealth,
  useServerLatency,
  useServiceUsage,
  useServerErrors,
} from '@/lib/hooks/use-server-status'
import { useSearchAnalytics } from '@/lib/hooks/use-metrics'
import { QueryErrorState } from '@/components/dashboard/panels/shared/query-error-state'
import { cn } from '@/lib/utils'
import { deriveServerStatusKpis } from './server-status-kpis'
import {
  buildLatencyDistributionSeries,
  buildThroughputErrorsSeries,
} from './server-status-chart-series'

interface ServerStatusPanelProps {
  className?: string
}

export function ServerStatusPanel({ className }: ServerStatusPanelProps) {
  const healthQuery = useServerHealth()
  const latencyQuery = useServerLatency()
  const servicesQuery = useServiceUsage()
  const errorsQuery = useServerErrors()
  const analyticsQuery = useSearchAnalytics('7d')
  const health = healthQuery.data
  const latency = latencyQuery.data
  const services = servicesQuery.data
  const errors = errorsQuery.data
  const searchAnalytics = analyticsQuery.data
  const latencyLoading = latencyQuery.isLoading
  const errorsLoading = errorsQuery.isLoading
  const analyticsLoading = analyticsQuery.isLoading
  const hasTopCardsData =
    latency !== undefined &&
    services !== undefined &&
    errors !== undefined &&
    searchAnalytics !== undefined
  const isTopCardsInitialLoading =
    (
      latencyQuery.isPending ||
      servicesQuery.isPending ||
      errorsQuery.isPending ||
      analyticsQuery.isPending
    ) && !hasTopCardsData

  const hasQueryError =
    healthQuery.isError ||
    latencyQuery.isError ||
    servicesQuery.isError ||
    errorsQuery.isError
  const topCards = deriveServerStatusKpis({
    latency,
    services,
    errors,
    searchAnalytics,
  })
  const latencyDistributionData = useMemo(
    () =>
      buildLatencyDistributionSeries(latency?.history || [], {
        pointCount: 24,
        windowHours: 4,
      }),
    [latency]
  )
  const throughputErrorsData = useMemo(
    () =>
      buildThroughputErrorsSeries(searchAnalytics || [], errors || [], latency, {
        pointCount: 24,
      }),
    [errors, latency, searchAnalytics]
  )

  if (hasQueryError && (!health || !latency || !services || !errors)) {
    const error = healthQuery.error || latencyQuery.error || servicesQuery.error || errorsQuery.error
    const errorMessage = error instanceof Error ? error.message : 'Unable to load server status data.'

    return (
      <QueryErrorState
        title="Server status unavailable"
        description={errorMessage}
        onRetry={() => {
          void Promise.all([
            healthQuery.refetch(),
            latencyQuery.refetch(),
            servicesQuery.refetch(),
            errorsQuery.refetch(),
          ])
        }}
      />
    )
  }

  return (
    <div className={cn('space-y-(--metric-card-section-gap)', className)}>
      {/* Status Overview */}
      <div aria-busy={isTopCardsInitialLoading}>
        {isTopCardsInitialLoading ? (
          <MonitoringMetricCardsSkeleton count={4} />
        ) : (
          <MonitoringMetricCardsGrid>
            {topCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                valueSuffix={card.valueSuffix}
                valueFormat={card.valueFormat}
                change={card.change}
                changeType={card.changeType}
                sparkline={card.sparkline}
                animationMode="on-change"
              />
            ))}
          </MonitoringMetricCardsGrid>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">Latency Distribution</CardTitle>
            <CardDescription className="typography-size-sm text-muted-foreground">
              p50, p95, p99 percentiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latencyLoading ? (
              <div className="h-[280px] bg-muted rounded animate-pulse" />
            ) : (
              <Suspense fallback={<div className="h-[280px] bg-muted rounded animate-pulse" />}>
                <LatencyDistributionChart data={latencyDistributionData} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">Throughput &amp; Errors</CardTitle>
            <CardDescription className="typography-size-sm text-muted-foreground">
              Requests vs errors per hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorsLoading || analyticsLoading ? (
              <div className="h-[280px] bg-muted rounded animate-pulse" />
            ) : (
              <Suspense fallback={<div className="h-[280px] bg-muted rounded animate-pulse" />}>
                <ThroughputErrorsChart data={throughputErrorsData} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>

      <TracesPanel legacyErrors={errors || []} />
    </div>
  )
}
