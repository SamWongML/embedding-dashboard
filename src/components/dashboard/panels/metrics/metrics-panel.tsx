'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from './metric-card'
import { TopUsersTable } from './top-users-table'
import { TrendsChart } from '@/components/charts/trends-chart'
import { TopHitsChart } from '@/components/charts/top-hits-chart'
import { ActivityHeatmap } from '@/components/charts/activity-heatmap'
import {
  MonitoringMetricCardsGrid,
  MonitoringMetricCardsSkeleton,
} from '@/components/dashboard/panels/shared/monitoring-metric-cards-loading'
import { useMetricsOverview } from '@/lib/hooks/use-metrics'
import { QueryErrorState } from '@/components/dashboard/panels/shared/query-error-state'
import { useDashboardPageHeaderActions } from '@/components/dashboard/layout/dashboard-page-header-context'
import { cn } from '@/lib/utils'

interface MetricsPanelProps {
  className?: string
}

type Period = '24h' | '7d' | '30d'

export function MetricsPanel({ className }: MetricsPanelProps) {
  const [period, setPeriod] = useState<Period>('24h')
  const pageHeaderActions = useMemo(
    () => (
      <Tabs
        value={period}
        onValueChange={(value) => setPeriod(value as Period)}
        aria-label="Usage analytics time interval"
        className="w-full sm:w-auto"
      >
        <TabsList aria-label="Usage analytics time interval" className="w-full sm:w-auto">
          <TabsTrigger value="24h">24h</TabsTrigger>
          <TabsTrigger value="7d">7d</TabsTrigger>
          <TabsTrigger value="30d">30d</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
    [period]
  )

  useDashboardPageHeaderActions(pageHeaderActions)

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useMetricsOverview(period)
  const isInitialLoading = isPending && !data
  const isMetricCardsInitialLoading = isInitialLoading

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to fetch metrics from API.'
    return (
      <QueryErrorState
        title="Metrics unavailable"
        description={errorMessage}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!isInitialLoading && !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="typography-size-base typography-weight-medium">Metrics</CardTitle>
        </CardHeader>
        <CardContent className="typography-size-sm text-muted-foreground">
          No metrics data is available yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-(--metric-card-section-gap)', className)}>
      {/* Metric Cards */}
      <div aria-busy={isMetricCardsInitialLoading}>
        {isMetricCardsInitialLoading ? (
          <MonitoringMetricCardsSkeleton count={4} />
        ) : (
          <MonitoringMetricCardsGrid>
            {data?.cards.map((metric) => (
              <MetricCard
                key={metric.label}
                metric={metric}
                animationMode="on-change"
              />
            ))}
          </MonitoringMetricCardsGrid>
        )}
      </div>

      {/* Trends + Activity */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1.15fr)]">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">
              Embedding Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="h-[300px] bg-muted rounded animate-pulse" />
            ) : (
              <TrendsChart data={data?.trends || []} period={period} />
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">
              Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1">
            {isInitialLoading ? (
              <div className="h-[300px] w-full rounded bg-muted animate-pulse" />
            ) : (
              <ActivityHeatmap data={data?.searchAnalytics || []} period={period} className="h-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">
              Most Accessed Embeddings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="h-[200px] bg-muted rounded animate-pulse" />
            ) : (
              <TopHitsChart data={data?.topHits || []} />
            )}
          </CardContent>
        </Card>

        {isInitialLoading ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="typography-size-base typography-weight-medium">Top Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ) : (
          <TopUsersTable users={data?.topUsers || []} />
        )}
      </div>
    </div>
  )
}
