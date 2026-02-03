'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from './metric-card'
import { TopUsersTable } from './top-users-table'
import { TrendsChart } from '@/components/charts/trends-chart'
import { TopHitsChart } from '@/components/charts/top-hits-chart'
import { useMetricsOverview } from '@/lib/hooks/use-metrics'
import { cn } from '@/lib/utils'

interface MetricsPanelProps {
  className?: string
}

type Period = '24h' | '7d' | '30d'

export function MetricsPanel({ className }: MetricsPanelProps) {
  const [period, setPeriod] = useState<Period>('24h')
  const { data, isLoading } = useMetricsOverview(period)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Period Selector */}
      <div className="flex justify-end">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          data?.cards.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))
        )}
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Embedding Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] bg-muted rounded animate-pulse" />
          ) : (
            <TrendsChart data={data?.trends || []} />
          )}
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Most Accessed Embeddings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] bg-muted rounded animate-pulse" />
            ) : (
              <TopHitsChart data={data?.topHits || []} />
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Top Users</CardTitle>
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
