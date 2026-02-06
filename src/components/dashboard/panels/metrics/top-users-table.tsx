'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { TopUser } from '@/lib/schemas/metrics'

interface TopUsersTableProps {
  users: TopUser[]
  className?: string
}

export function TopUsersTable({ users, className }: TopUsersTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px]">
          <div className="divide-y divide-border">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-(--list-item-gap) px-(--list-item-padding-x) py-(--list-item-padding-y) hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium text-muted-foreground w-4">
                  {index + 1}
                </span>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCount(user.requestCount)}
                  </p>
                  <p className="text-xs text-muted-foreground">requests</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
