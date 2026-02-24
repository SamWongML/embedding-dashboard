'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ErrorLog } from '@/lib/schemas/server-status'

interface ErrorListProps {
  errors: ErrorLog[]
  className?: string
}

const levelConfig = {
  error: {
    variant: 'destructive' as const,
    label: 'Error',
  },
  warning: {
    variant: 'secondary' as const,
    label: 'Warning',
  },
  info: {
    variant: 'outline' as const,
    label: 'Info',
  },
}

export function ErrorList({ errors, className }: ErrorListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="typography-size-sm typography-weight-medium">Recent Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {errors.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground typography-size-sm">
              No recent errors
            </div>
          ) : (
            <div className="divide-y divide-border">
              {errors.map((error) => {
                const config = levelConfig[error.level]
                return (
                  <div key={error.id} className="px-(--list-item-padding-x) py-(--list-item-padding-y) hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between gap-(--list-item-gap) mb-0.5">
                      <div className="flex items-center gap-(--list-item-gap)">
                        <Badge variant={config.variant} className="typography-size-xs">
                          {config.label}
                        </Badge>
                        <span className="typography-size-xs text-muted-foreground">
                          {error.source}
                        </span>
                      </div>
                      <span className="typography-size-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(error.timestamp)}
                      </span>
                    </div>
                    <p className="typography-size-sm text-foreground line-clamp-2">
                      {error.message}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
