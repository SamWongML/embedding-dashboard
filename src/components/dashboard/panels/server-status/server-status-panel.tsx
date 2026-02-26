'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './stat-card'
import { ErrorList } from './error-list'
import { LatencyChart } from '@/components/charts/latency-chart'
import { ServiceUsageChart } from '@/components/charts/service-usage-chart'
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
  const servicesLoading = servicesQuery.isLoading
  const errorsLoading = errorsQuery.isLoading

  const hasQueryError =
    healthQuery.isError ||
    latencyQuery.isError ||
    servicesQuery.isError ||
    errorsQuery.isError

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

  const topCards = deriveServerStatusKpis({
    latency,
    services,
    errors,
    searchAnalytics,
  })

  return (
    <div className={cn('space-y-(--metric-card-section-gap)', className)}>
      {/* Status Overview */}
      <div className="grid auto-rows-fr gap-(--metric-card-grid-gap) [grid-template-columns:repeat(auto-fit,minmax(var(--metric-card-grid-min-width),1fr))]">
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
            animationMode="on-mount"
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">Latency Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {latencyLoading ? (
              <div className="h-[200px] bg-muted rounded animate-pulse" />
            ) : (
              <Suspense fallback={<div className="h-[200px] bg-muted rounded animate-pulse" />}>
                <LatencyChart data={latency?.history || []} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">Service Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="h-[200px] bg-muted rounded animate-pulse" />
            ) : (
              <Suspense fallback={<div className="h-[200px] bg-muted rounded animate-pulse" />}>
                <ServiceUsageChart data={services || []} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Log */}
      {errorsLoading ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="typography-size-base typography-weight-medium">Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ) : (
        <ErrorList errors={errors || []} />
      )}
    </div>
  )
}
