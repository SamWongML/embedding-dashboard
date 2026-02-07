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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toNoOpActionMessage } from '@/lib/api'

export default function SecurityTab() {
  const [actionWarning, setActionWarning] = React.useState<string | null>(null)

  const handleNoOpAction = React.useCallback((actionLabel: string) => {
    setActionWarning(toNoOpActionMessage(actionLabel))
  }, [])

  return (
    <div className="space-y-6">
      {actionWarning ? (
        <ActionWarningState
          title="Security action not available"
          variant="warning"
          description={actionWarning}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Manage active sessions across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Current device</div>
              <p className="text-xs text-muted-foreground">
                San Francisco, CA · Chrome on macOS
              </p>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">iPhone 15 Pro</div>
              <p className="text-xs text-muted-foreground">
                Last active 2 hours ago
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNoOpAction('Sign out selected device')}
            >
              Sign out
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button
            variant="outline"
            onClick={() => handleNoOpAction('Sign out all devices')}
          >
            Sign out all devices
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Add additional security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Two-factor authentication</div>
              <p className="text-xs text-muted-foreground">
                Require a second factor when signing in.
              </p>
            </div>
            <Switch
              onCheckedChange={() =>
                handleNoOpAction('Update two-factor authentication setting')
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Trusted devices</div>
              <p className="text-xs text-muted-foreground">
                Skip prompts on devices you approve.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNoOpAction('Manage trusted devices')}
            >
              Manage devices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
