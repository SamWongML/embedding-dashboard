"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PermissionMatrix } from "@/lib/schemas/users"

interface PermissionsMatrixProps {
  permissions: PermissionMatrix | undefined
  isLoading: boolean
}

export function PermissionsMatrix({
  permissions,
  isLoading,
}: PermissionsMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Permission Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded bg-muted" />
        ) : permissions ? (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  {permissions.roles.map((role) => (
                    <TableHead key={role.role} className="capitalize">
                      {role.role}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.resources.map((resource) => (
                  <TableRow key={resource}>
                    <TableCell className="font-medium capitalize">
                      {resource}
                    </TableCell>
                    {permissions.roles.map((role) => (
                      <TableCell key={`${resource}-${role.role}`}>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions[resource]?.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : null}
      </CardContent>
    </Card>
  )
}
