import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import SettingsClient from './settings-client'

export default function SettingsPage() {
  return (
    <DashboardPageShell title="Settings">
      <SettingsClient />
    </DashboardPageShell>
  )
}
