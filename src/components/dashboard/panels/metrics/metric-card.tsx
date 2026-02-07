'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/sparkline'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { MetricCard as MetricCardType } from '@/lib/schemas/metrics'

interface MetricCardProps {
  metric: MetricCardType
  className?: string
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  const TrendIcon = metric.changeType === 'increase' ? ArrowUp :
    metric.changeType === 'decrease' ? ArrowDown : Minus

  const trendColor = metric.changeType === 'increase' ? 'text-success' :
    metric.changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(metric.value)}
            </div>
            <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(metric.change)}%</span>
            </div>
          </div>
          {metric.sparkline && (
            <Sparkline
              data={metric.sparkline}
              className="h-10 w-20"
              tone={
                metric.changeType === 'increase'
                  ? 'success'
                  : metric.changeType === 'decrease'
                    ? 'error'
                    : 'muted'
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
