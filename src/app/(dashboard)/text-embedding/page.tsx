import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { TextEmbeddingPanel } from '@/components/dashboard/panels/text-embedding/text-embedding-panel'

export const metadata: Metadata = {
  title: 'Text Embedding',
}

export default function TextEmbeddingPage() {
  return (
    <DashboardPageShell title="Text Embedding">
      <TextEmbeddingPanel />
    </DashboardPageShell>
  )
}
