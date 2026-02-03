import { Metadata } from 'next'
import { MetricsPanel } from '@/components/dashboard/panels/metrics'

export const metadata: Metadata = {
  title: 'Metrics',
}

export const dynamic = 'force-dynamic'

export default function MetricsPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <h1 className="text-lg font-semibold">Metrics</h1>
      </header>
      <div className="flex-1 p-6">
        <MetricsPanel />
      </div>
    </div>
  )
}
