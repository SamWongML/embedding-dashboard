'use client'

import * as React from 'react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toNoOpActionMessage } from '@/lib/api'
import { useAccount } from '@/lib/hooks/use-account'

export default function WorkspaceTab() {
  const { activeWorkspace } = useAccount()
  const [actionWarning, setActionWarning] = React.useState<string | null>(null)

  const handleNoOpAction = React.useCallback((actionLabel: string) => {
    setActionWarning(toNoOpActionMessage(actionLabel))
  }, [])

  return (
    <div className="space-y-6">
      {actionWarning ? (
        <ActionWarningState
          title="Workspace action not available"
          variant="warning"
          description={actionWarning}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage who has access to {activeWorkspace.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Avery Chen</div>
              <p className="text-xs text-muted-foreground">Owner</p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Jordan Lee</div>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <Badge variant="outline">Admin</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Sam Rivera</div>
              <p className="text-xs text-muted-foreground">Member</p>
            </div>
            <Badge variant="outline">Member</Badge>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button onClick={() => handleNoOpAction('Add member')}>
            Add member
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Review your plan and payment method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Current plan</div>
              <p className="text-xs text-muted-foreground">
                {activeWorkspace.plan.toUpperCase()} plan
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNoOpAction('Manage billing')}
            >
              Manage billing
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Payment method</div>
              <p className="text-xs text-muted-foreground">Visa ending in 4242</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNoOpAction('Update payment method')}
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
