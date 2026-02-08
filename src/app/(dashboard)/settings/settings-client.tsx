'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AccountTab from './tabs/account-tab'
import NotificationsTab from './tabs/notifications-tab'
import PreferencesTab from './tabs/preferences-tab'
import SecurityTab from './tabs/security-tab'
import WorkspaceTab from './tabs/workspace-tab'

const tabs = [
  { value: 'account', label: 'Account' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security & Access' },
  { value: 'workspace', label: 'Workspace' },
] as const

type SettingsTabValue = (typeof tabs)[number]['value']

function isSettingsTabValue(value: string): value is SettingsTabValue {
  return tabs.some((tab) => tab.value === value)
}

function parseSettingsTab(value: string | null): SettingsTabValue {
  if (value && isSettingsTabValue(value)) {
    return value
  }

  return 'account'
}

function renderSettingsTabContent(value: SettingsTabValue) {
  if (value === 'account') return <AccountTab />
  if (value === 'preferences') return <PreferencesTab />
  if (value === 'notifications') return <NotificationsTab />
  if (value === 'security') return <SecurityTab />
  return <WorkspaceTab />
}

export default function SettingsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasMounted, setHasMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<SettingsTabValue>(() =>
    parseSettingsTab(searchParams.get('tab'))
  )

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  React.useEffect(() => {
    const tabFromSearchParams = parseSettingsTab(searchParams.get('tab'))
    if (tabFromSearchParams !== activeTab) {
      setActiveTab(tabFromSearchParams)
    }
  }, [searchParams, activeTab])

  const handleTabChange = React.useCallback(
    (value: string) => {
      if (!isSettingsTabValue(value)) {
        return
      }

      setActiveTab(value)
      router.replace(`/settings?tab=${value}`)
    },
    [router]
  )

  if (!hasMounted) {
    return (
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-56">
          <div className="text-muted-foreground flex flex-col gap-1">
            {tabs.map((tab) => (
              <div
                key={tab.value}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === tab.value ? 'bg-muted text-foreground' : ''
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-6">
          {renderSettingsTabContent(activeTab)}
        </div>
      </div>
    )
  }

  return (
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
        <TabsContent value="account">{renderSettingsTabContent('account')}</TabsContent>
        <TabsContent value="preferences">
          {renderSettingsTabContent('preferences')}
        </TabsContent>
        <TabsContent value="notifications">
          {renderSettingsTabContent('notifications')}
        </TabsContent>
        <TabsContent value="security">{renderSettingsTabContent('security')}</TabsContent>
        <TabsContent value="workspace">
          {renderSettingsTabContent('workspace')}
        </TabsContent>
      </div>
    </Tabs>
  )
}
