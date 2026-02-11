import { Metadata } from 'next'
import { ServerStatusPanel } from '@/components/dashboard/panels/server-status/server-status-panel'

export const metadata: Metadata = {
  title: 'Server Status',
}

export default function ServerStatusPage() {
  return <ServerStatusPanel />
}
