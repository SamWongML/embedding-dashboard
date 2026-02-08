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

const tabDomIds: Record<SettingsTabValue, { trigger: string; content: string }> = {
  account: {
    trigger: 'settings-tab-trigger-account',
    content: 'settings-tab-content-account',
  },
  preferences: {
    trigger: 'settings-tab-trigger-preferences',
    content: 'settings-tab-content-preferences',
  },
  notifications: {
    trigger: 'settings-tab-trigger-notifications',
    content: 'settings-tab-content-notifications',
  },
  security: {
    trigger: 'settings-tab-trigger-security',
    content: 'settings-tab-content-security',
  },
  workspace: {
    trigger: 'settings-tab-trigger-workspace',
    content: 'settings-tab-content-workspace',
  },
}

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
  const activeTab = parseSettingsTab(searchParams.get('tab'))

  const handleTabChange = React.useCallback(
    (value: string) => {
      if (!isSettingsTabValue(value)) {
        return
      }

      if (value === activeTab) {
        return
      }

      const nextSearchParams = new URLSearchParams(searchParams.toString())
      nextSearchParams.set('tab', value)
      router.replace(`/settings?${nextSearchParams.toString()}`)
    },
    [activeTab, router, searchParams]
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
            id={tabDomIds[tab.value].trigger}
            aria-controls={tabDomIds[tab.value].content}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="min-w-0 flex-1 space-y-6">
        <TabsContent
          value="account"
          id={tabDomIds.account.content}
          aria-labelledby={tabDomIds.account.trigger}
        >
          {renderSettingsTabContent('account')}
        </TabsContent>
        <TabsContent
          value="preferences"
          id={tabDomIds.preferences.content}
          aria-labelledby={tabDomIds.preferences.trigger}
        >
          {renderSettingsTabContent('preferences')}
        </TabsContent>
        <TabsContent
          value="notifications"
          id={tabDomIds.notifications.content}
          aria-labelledby={tabDomIds.notifications.trigger}
        >
          {renderSettingsTabContent('notifications')}
        </TabsContent>
        <TabsContent
          value="security"
          id={tabDomIds.security.content}
          aria-labelledby={tabDomIds.security.trigger}
        >
          {renderSettingsTabContent('security')}
        </TabsContent>
        <TabsContent
          value="workspace"
          id={tabDomIds.workspace.content}
          aria-labelledby={tabDomIds.workspace.trigger}
        >
          {renderSettingsTabContent('workspace')}
        </TabsContent>
      </div>
    </Tabs>
  )
}
