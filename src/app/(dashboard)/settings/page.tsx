import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import SettingsClient from './settings-client'

function SettingsClientFallback() {
  return (
    <div className="rounded-md border border-dashed border-border p-6 typography-size-sm text-muted-foreground">
      Loading settings...
    </div>
  )
}

interface SettingsPageProps {
  searchParams?: Promise<{ tab?: string }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = (await searchParams) ?? {}

  if (params.tab === 'workspace') {
    redirect('/admin/workspace')
  }

  return (
    <Suspense fallback={<SettingsClientFallback />}>
      <SettingsClient />
    </Suspense>
  )
}
