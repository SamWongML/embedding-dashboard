import { Suspense } from 'react'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import SettingsClient from './settings-client'

function SettingsClientFallback() {
  return (
    <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
      Loading settings...
    </div>
  )
}

export default function SettingsPage() {
  return (
    <DashboardPageShell title="Settings">
      <Suspense fallback={<SettingsClientFallback />}>
        <SettingsClient />
      </Suspense>
    </DashboardPageShell>
  )
}
