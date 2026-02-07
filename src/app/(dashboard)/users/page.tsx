import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { UsersPanel } from '@/components/dashboard/panels/users/users-panel'

export const metadata: Metadata = {
  title: 'Users',
}

export default function UsersPage() {
  return (
    <DashboardPageShell title="User Management">
      <UsersPanel />
    </DashboardPageShell>
  )
}
