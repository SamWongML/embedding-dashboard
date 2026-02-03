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

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {errors.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No recent errors
            </div>
          ) : (
            <div className="divide-y divide-border">
              {errors.map((error) => {
                const config = levelConfig[error.level]
                return (
                  <div key={error.id} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant} className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {error.source}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(error.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
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
