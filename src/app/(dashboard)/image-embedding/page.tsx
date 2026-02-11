import { Metadata } from 'next'
import { ImageEmbeddingPanel } from '@/components/dashboard/panels/image-embedding/image-embedding-panel'

export const metadata: Metadata = {
  title: 'Image Embedding',
}

export default function ImageEmbeddingPage() {
  return <ImageEmbeddingPanel />
}
