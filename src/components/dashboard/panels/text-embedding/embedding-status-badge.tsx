'use client'

import type { ComponentType, ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  CircleCheck,
  CircleX,
  Clock3,
  Loader2,
} from 'lucide-react'
import type { EmbeddingQueueStatus } from '@/lib/schemas/text-embedding'
import { cn } from '@/lib/utils'

type StatusIcon = ComponentType<{ className?: string }>

const statusConfig: Record<
  EmbeddingQueueStatus,
  {
    label: string
    variant: ComponentProps<typeof Badge>['variant']
    icon: StatusIcon
    iconClassName?: string
  }
> = {
  queued: {
    label: 'Queued',
    variant: 'gray-subtle',
    icon: Clock3,
  },
  processing: {
    label: 'Processing',
    variant: 'blue-subtle',
    icon: Loader2,
    iconClassName: 'animate-spin',
  },
  completed: {
    label: 'Completed',
    variant: 'green-subtle',
    icon: CircleCheck,
  },
  failed: {
    label: 'Failed',
    variant: 'red-subtle',
    icon: CircleX,
  },
}

export function getEmbeddingStatusConfig(status: EmbeddingQueueStatus) {
  return statusConfig[status]
}

interface EmbeddingStatusBadgeProps {
  status: EmbeddingQueueStatus
  className?: string
}

export function EmbeddingStatusBadge({
  status,
  className,
}: EmbeddingStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      <Icon className={cn('h-3.5 w-3.5', config.iconClassName)} aria-hidden />
      <span>{config.label}</span>
    </Badge>
  )
}
