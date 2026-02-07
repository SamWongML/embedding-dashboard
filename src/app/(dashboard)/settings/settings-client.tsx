'use client'

import * as React from 'react'
import dynamicImport from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const tabs = [
  { value: 'account', label: 'Account' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security & Access' },
  { value: 'workspace', label: 'Workspace' },
]

const TabFallback = () => (
  <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
    Loading settings...
  </div>
)

const AccountTab = dynamicImport(
  () => import('./tabs/account-tab').then((mod) => mod.default),
  {
    loading: TabFallback,
  }
)
const PreferencesTab = dynamicImport(
  () => import('./tabs/preferences-tab').then((mod) => mod.default),
  {
    loading: TabFallback,
  }
)
const NotificationsTab = dynamicImport(
  () => import('./tabs/notifications-tab').then((mod) => mod.default),
  {
    loading: TabFallback,
  }
)
const SecurityTab = dynamicImport(
  () => import('./tabs/security-tab').then((mod) => mod.default),
  {
    loading: TabFallback,
  }
)
const WorkspaceTab = dynamicImport(
  () => import('./tabs/workspace-tab').then((mod) => mod.default),
  {
    loading: TabFallback,
  }
)

export default function SettingsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'account'
  const [activeTab, setActiveTab] = React.useState(initialTab)

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
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="workspace">
          <WorkspaceTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}
