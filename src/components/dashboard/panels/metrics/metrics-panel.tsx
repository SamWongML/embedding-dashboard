'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconButton } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from './metric-card'
import { TopUsersTable } from './top-users-table'
import { TrendsChart } from '@/components/charts/trends-chart'
import { TopHitsChart } from '@/components/charts/top-hits-chart'
import { ActivityHeatmap } from '@/components/charts/activity-heatmap'
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
import {
  buildActivityHeatmapRowRanges,
  buildActivityHeatmapRows,
} from '@/components/charts/activity-heatmap-utils'
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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
  const [weekPage, setWeekPage] = useState(0)
  const pageHeaderActions = useMemo(
    () => (
      <Tabs
        value={period}
        onValueChange={(value) => {
          setPeriod(value as Period)
          setWeekPage(0)
        }}
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
  const heatmapRows = useMemo(
    () =>
      period === '30d'
        ? buildActivityHeatmapRows(data?.searchAnalytics || [], period)
        : [],
    [data?.searchAnalytics, period]
  )
  const weekRanges = useMemo(
    () => buildActivityHeatmapRowRanges(heatmapRows.length, 7),
    [heatmapRows.length]
  )
  const hasWeekPagination = period === '30d' && weekRanges.length > 1
  const maxWeekPage = Math.max(0, weekRanges.length - 1)
  const resolvedWeekPage = Math.min(weekPage, maxWeekPage)
  const visibleWeekRange = period === '30d' ? weekRanges[resolvedWeekPage] : undefined

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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1.15fr)]">
=======
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1.05fr)]">
>>>>>>> theirs
=======
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1.05fr)]">
>>>>>>> theirs
=======
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1.05fr)]">
>>>>>>> theirs
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="typography-size-base typography-weight-medium">
              Embedding Trends
            </CardTitle>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="h-[300px] bg-muted rounded animate-pulse" />
            ) : (
              <TrendsChart data={data?.trends || []} period={period} />
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            <CardDescription className="typography-size-sm text-muted-foreground">
              Text, image, and search request volume over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="h-(--chart-height-standard) bg-muted rounded animate-pulse" />
            ) : (
              <TrendsChart
                data={data?.trends || []}
                period={period}
                className="h-(--chart-height-standard)"
              />
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          <CardHeader className="relative pb-2">
            <CardTitle className="pr-20 typography-size-base typography-weight-medium">
              Activity Heatmap
            </CardTitle>
            <CardDescription className="pr-20 truncate typography-size-sm text-muted-foreground">
              Hourly request intensity across the selected range (UTC)
            </CardDescription>
            <div
              data-slot="activity-heatmap-week-nav"
              className="absolute right-(--card-padding) top-(--card-padding) flex items-center gap-1.5"
            >
              <IconButton
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Previous week"
                data-slot="activity-heatmap-week-prev"
                className={hasWeekPagination ? undefined : 'invisible pointer-events-none'}
                disabled={!hasWeekPagination || resolvedWeekPage >= maxWeekPage}
                onClick={() => {
                  setWeekPage((currentWeekPage) => Math.min(maxWeekPage, currentWeekPage + 1))
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <IconButton
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Next week"
                data-slot="activity-heatmap-week-next"
                className={hasWeekPagination ? undefined : 'invisible pointer-events-none'}
                disabled={!hasWeekPagination || resolvedWeekPage <= 0}
                onClick={() => {
                  setWeekPage((currentWeekPage) => Math.max(0, currentWeekPage - 1))
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </IconButton>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1">
            {isInitialLoading ? (
              <div className="h-(--chart-height-standard) w-full rounded bg-muted animate-pulse" />
            ) : (
              <ActivityHeatmap
                data={data?.searchAnalytics || []}
                period={period}
                visibleRowRange={visibleWeekRange}
                className="h-full min-h-(--chart-height-standard)"
              />
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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
            <CardDescription className="typography-size-sm text-muted-foreground">
              Top embeddings by request count
            </CardDescription>
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
