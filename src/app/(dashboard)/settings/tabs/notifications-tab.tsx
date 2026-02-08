'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export default function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Decide which updates you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="typography-copy-14 font-medium">Product updates</div>
            <p className="typography-copy-13 text-muted-foreground">
              Major releases and feature announcements.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="typography-copy-14 font-medium">Workspace activity</div>
            <p className="typography-copy-13 text-muted-foreground">
              Mentions, comments, and shared links.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="typography-copy-14 font-medium">Security alerts</div>
            <p className="typography-copy-13 text-muted-foreground">
              Unusual sign-in activity and admin changes.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
