import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { SearchPanel } from '@/components/dashboard/panels/search/search-panel'

export const metadata: Metadata = {
  title: 'Hybrid Search',
}

export default function SearchPage() {
  return (
    <DashboardPageShell title="Hybrid Search">
      <SearchPanel />
    </DashboardPageShell>
  )
}
