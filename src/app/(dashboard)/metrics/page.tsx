import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { MetricsPanel } from '@/components/dashboard/panels/metrics/metrics-panel'

export const metadata: Metadata = {
  title: 'Metrics',
}

export default function MetricsPage() {
  return (
    <DashboardPageShell title="Metrics">
      <MetricsPanel />
    </DashboardPageShell>
  )
}
