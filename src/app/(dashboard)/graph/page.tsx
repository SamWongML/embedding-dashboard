import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import GraphPageClient from './graph-page-client'

export const metadata: Metadata = {
  title: 'Graph',
}

export default function GraphPage() {
  return (
    <DashboardPageShell title="Knowledge Graph">
      <GraphPageClient />
    </DashboardPageShell>
  )
}
