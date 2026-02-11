import { Metadata } from 'next'
import { MetricsPanel } from '@/components/dashboard/panels/metrics/metrics-panel'

export const metadata: Metadata = {
  title: 'Metrics',
}

export default function MetricsPage() {
  return <MetricsPanel />
}
