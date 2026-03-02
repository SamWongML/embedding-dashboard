import type { Metadata } from 'next'
import MetricsPageClient from './metrics-page-client'

export const metadata: Metadata = {
  title: 'Usage Analytics',
}

export default function MetricsPage() {
  return <MetricsPageClient />
}
