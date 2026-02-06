'use client'

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

export default function SecurityTab() {
  return (
    <div className="space-y-6">
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
            <Button variant="ghost" size="sm">
              Sign out
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button variant="outline">Sign out all devices</Button>
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
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Trusted devices</div>
              <p className="text-xs text-muted-foreground">
                Skip prompts on devices you approve.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage devices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
