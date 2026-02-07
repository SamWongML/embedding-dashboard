import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { RecordsPanel } from '@/components/dashboard/panels/records/records-panel'

export const metadata: Metadata = {
  title: 'Records',
}

export default function RecordsPage() {
  return (
    <DashboardPageShell title="Embedding Records">
      <RecordsPanel />
    </DashboardPageShell>
  )
}
