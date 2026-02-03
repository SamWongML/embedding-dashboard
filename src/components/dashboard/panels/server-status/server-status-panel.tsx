'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthIndicator } from './health-indicator'
import { StatCard } from './stat-card'
import { ErrorList } from './error-list'
import { LatencyChart } from '@/components/charts/latency-chart'
import { ServiceUsageChart } from '@/components/charts/service-usage-chart'
import {
  useServerHealth,
  useServerLatency,
  useServiceUsage,
  useServerErrors,
  useRealtimeLatency,
} from '@/lib/hooks/use-server-status'
import { Activity, Clock, Zap, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServerStatusPanelProps {
  className?: string
}

export function ServerStatusPanel({ className }: ServerStatusPanelProps) {
  const { data: health, isLoading: healthLoading } = useServerHealth()
  const { data: latency, isLoading: latencyLoading } = useServerLatency()
  const { data: services, isLoading: servicesLoading } = useServiceUsage()
  const { data: errors, isLoading: errorsLoading } = useServerErrors()
  const { latency: realtimeLatency, isConnected } = useRealtimeLatency()

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return `${days}d ${hours}h`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Status
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            ) : (
              <HealthIndicator status={health?.status || 'healthy'} />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              v{health?.version || '1.0.0'}
            </p>
          </CardContent>
        </Card>

        <StatCard
          title="Uptime"
          value={healthLoading ? '...' : formatUptime(health?.uptime || 0)}
          icon={<Clock className="h-4 w-4" />}
        />

        <StatCard
          title="Current Latency"
          value={`${realtimeLatency ?? latency?.current ?? 0}ms`}
          subtitle={isConnected ? 'Real-time' : 'Polling'}
          icon={<Zap className="h-4 w-4" />}
        />

        <StatCard
          title="P99 Latency"
          value={`${latency?.p99 || 0}ms`}
          subtitle={`Avg: ${latency?.average || 0}ms`}
          icon={<AlertCircle className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Latency Over Time</CardTitle>
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
            <CardTitle className="text-base font-medium">Service Usage</CardTitle>
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
            <CardTitle className="text-base font-medium">Recent Logs</CardTitle>
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
