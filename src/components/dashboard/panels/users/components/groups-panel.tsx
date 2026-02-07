"use client"

import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserGroup } from "@/lib/schemas/users"

interface GroupsPanelProps {
  groups: UserGroup[] | undefined
  isLoading: boolean
}

export function GroupsPanel({ groups, isLoading }: GroupsPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          User Groups
        </CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {groups?.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h4 className="font-medium">{group.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {group.memberCount} members
                    </p>
                    <div className="mt-1 flex gap-1">
                      {group.permissions.slice(0, 3).map((permission) => (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="text-xs"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
