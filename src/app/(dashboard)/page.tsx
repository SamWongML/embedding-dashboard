import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { ServerStatusPanel } from '@/components/dashboard/panels/server-status/server-status-panel'

export const metadata: Metadata = {
  title: 'Server Status',
}

export default function ServerStatusPage() {
  return (
    <DashboardPageShell title="Server Status">
      <ServerStatusPanel />
    </DashboardPageShell>
  )
}
