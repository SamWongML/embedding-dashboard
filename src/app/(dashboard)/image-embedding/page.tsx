import { Metadata } from 'next'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { ImageEmbeddingPanel } from '@/components/dashboard/panels/image-embedding/image-embedding-panel'

export const metadata: Metadata = {
  title: 'Image Embedding',
}

export default function ImageEmbeddingPage() {
  return (
    <DashboardPageShell title="Image Embedding">
      <ImageEmbeddingPanel />
    </DashboardPageShell>
  )
}
