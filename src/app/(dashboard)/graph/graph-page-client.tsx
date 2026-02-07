'use client'

import dynamic from 'next/dynamic'

const GraphPanel = dynamic(
  () => import('@/components/dashboard/panels/graph/graph-panel').then((mod) => mod.GraphPanel),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading graph...</div> }
)

export default function GraphPageClient() {
  return <GraphPanel />
}
