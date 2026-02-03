'use client'

import dynamic from 'next/dynamic'

const GraphPanel = dynamic(
  () => import('@/components/dashboard/panels/graph').then((mod) => mod.GraphPanel),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading graph...</div> }
)

export default function GraphPageClient() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <h1 className="text-lg font-semibold">Knowledge Graph</h1>
      </header>
      <div className="flex-1 p-6">
        <GraphPanel />
      </div>
    </div>
  )
}
