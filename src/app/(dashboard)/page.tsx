import { Metadata } from 'next'
import { ServerStatusPanel } from '@/components/dashboard/panels/server-status'

export const metadata: Metadata = {
  title: 'Server Status',
}

export const dynamic = 'force-dynamic'

export default function ServerStatusPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <h1 className="text-lg font-semibold">Server Status</h1>
      </header>
      <div className="flex-1 p-6">
        <ServerStatusPanel />
      </div>
    </div>
  )
}
