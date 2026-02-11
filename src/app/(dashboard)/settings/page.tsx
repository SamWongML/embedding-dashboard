import { Suspense } from 'react'
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
    <Suspense fallback={<SettingsClientFallback />}>
      <SettingsClient />
    </Suspense>
  )
}
