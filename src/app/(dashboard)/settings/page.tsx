'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/components/providers/theme-provider'
import { useAccount } from '@/lib/hooks/use-account'
import { saveThemePreference } from '@/lib/preferences/preferences'

const tabs = [
  { value: 'account', label: 'Account' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security & Access' },
  { value: 'workspace', label: 'Workspace' },
]

function getInitials(name: string) {
  const [first, second] = name.split(' ')
  const initial = `${first?.[0] ?? ''}${second?.[0] ?? ''}`
  return initial.toUpperCase() || 'U'
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'account'
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const { theme, setTheme } = useTheme()
  const { user, activeWorkspace } = useAccount()

  React.useEffect(() => {
    if (searchParams.get('tab') && searchParams.get('tab') !== activeTab) {
      setActiveTab(searchParams.get('tab') || 'account')
    }
  }, [searchParams, activeTab])

  const handleTabChange = React.useCallback(
    (value: string) => {
      setActiveTab(value)
      router.replace(`/settings?tab=${value}`)
    },
    [router]
  )

  const handleThemeChange = React.useCallback(
    (value: 'light' | 'dark' | 'system') => {
      setTheme(value)
      void saveThemePreference(value)
    },
    [setTheme]
  )

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>
      <div className="flex-1 p-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          orientation="vertical"
          className="flex flex-col gap-8 md:flex-row"
        >
          <TabsList
            variant="line"
            className="w-full flex-col items-start gap-1 md:w-56"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full justify-start"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 flex-1 space-y-6">
            <TabsContent value="account">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Update your personal details and default workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <Avatar className="h-16 w-16">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                        ) : null}
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <Badge variant="secondary" className="mt-2">
                          {activeWorkspace.name}
                        </Badge>
                      </div>
                      <Button variant="outline" className="md:ml-auto">
                        Upload new photo
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="display-name">Display name</Label>
                        <Input id="display-name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue={user.email} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end border-t">
                    <Button>Save changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Default workspace</CardTitle>
                    <CardDescription>
                      Choose the workspace that opens first when you sign in.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select defaultValue={activeWorkspace.id}>
                      <SelectTrigger className="w-full md:w-72">
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={activeWorkspace.id}>
                          {activeWorkspace.name}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>
                      Choose your preferred appearance across the dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={theme}
                      onValueChange={(value) =>
                        handleThemeChange(value as 'light' | 'dark' | 'system')
                      }
                      className="grid gap-3"
                    >
                      <label className="flex items-center gap-3 rounded-md border border-border p-3">
                        <RadioGroupItem value="light" />
                        <div>
                          <div className="text-sm font-medium">Light</div>
                          <p className="text-xs text-muted-foreground">
                            Bright surfaces and crisp contrast.
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 rounded-md border border-border p-3">
                        <RadioGroupItem value="dark" />
                        <div>
                          <div className="text-sm font-medium">Dark</div>
                          <p className="text-xs text-muted-foreground">
                            Optimized for low-light work.
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 rounded-md border border-border p-3">
                        <RadioGroupItem value="system" />
                        <div>
                          <div className="text-sm font-medium">System</div>
                          <p className="text-xs text-muted-foreground">
                            Match your device appearance automatically.
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional settings</CardTitle>
                    <CardDescription>
                      Set your language and timezone preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="america-los-angeles">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="america-los-angeles">
                            America/Los_Angeles (UTC-8)
                          </SelectItem>
                          <SelectItem value="america-new-york">
                            America/New_York (UTC-5)
                          </SelectItem>
                          <SelectItem value="europe-london">
                            Europe/London (UTC+0)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
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
                      <div className="text-sm font-medium">Product updates</div>
                      <p className="text-xs text-muted-foreground">
                        Major releases and feature announcements.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">Workspace activity</div>
                      <p className="text-xs text-muted-foreground">
                        Mentions, comments, and shared links.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">Security alerts</div>
                      <p className="text-xs text-muted-foreground">
                        Unusual sign-in activity and admin changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
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
            </TabsContent>

            <TabsContent value="workspace">
              <div className="space-y-6">
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
                    <Button>Add member</Button>
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
                      <Button variant="outline" size="sm">
                        Manage billing
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium">Payment method</div>
                        <p className="text-xs text-muted-foreground">Visa ending in 4242</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
