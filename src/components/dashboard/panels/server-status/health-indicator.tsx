'use client'

import { cn } from '@/lib/utils'
import type { ServiceStatus } from '@/lib/schemas/server-status'

interface HealthIndicatorProps {
  status: ServiceStatus
  label?: string
  showPulse?: boolean
  className?: string
}

const statusConfig = {
  healthy: {
    color: 'bg-success',
    text: 'text-success',
    label: 'Healthy',
  },
  degraded: {
    color: 'bg-warning',
    text: 'text-warning',
    label: 'Degraded',
  },
  unhealthy: {
    color: 'bg-error',
    text: 'text-error',
    label: 'Unhealthy',
  },
}

export function HealthIndicator({
  status,
  label,
  showPulse = true,
  className,
}: HealthIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-3 w-3">
        {showPulse && status === 'healthy' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.color
            )}
          />
        )}
        <span
          className={cn('relative inline-flex rounded-full h-3 w-3', config.color)}
        />
      </span>
      <span className={cn('text-sm font-medium', config.text)}>
        {label || config.label}
      </span>
    </div>
  )
}
