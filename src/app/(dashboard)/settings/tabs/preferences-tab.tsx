'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { toActionErrorMessage, toNoOpActionMessage } from '@/lib/api'
import { useTheme } from '@/components/providers/theme-provider'
import { saveThemePreference } from '@/lib/preferences/preferences'

export default function PreferencesTab() {
  const { theme, setTheme } = useTheme()
  const [timezone, setTimezone] = React.useState('america-los-angeles')
  const [language, setLanguage] = React.useState('en')
  const [actionWarning, setActionWarning] = React.useState<string | null>(null)

  const handleThemeChange = React.useCallback(
    async (value: 'light' | 'dark' | 'system') => {
      setActionWarning(null)
      setTheme(value)

      try {
        await saveThemePreference(value)
      } catch (error) {
        setActionWarning(
          toActionErrorMessage(error, 'Unable to persist theme preference.')
        )
      }
    },
    [setTheme]
  )

  return (
    <div className="space-y-6">
      {actionWarning ? (
        <ActionWarningState
          title="Preferences update failed"
          variant="warning"
          description={actionWarning}
        />
      ) : null}

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
              void handleThemeChange(value as 'light' | 'dark' | 'system')
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
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value)
                setActionWarning(
                  toNoOpActionMessage('Update timezone preference')
                )
              }}
            >
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
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value)
                setActionWarning(
                  toNoOpActionMessage('Update language preference')
                )
              }}
            >
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
  )
}
