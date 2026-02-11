import { Metadata } from 'next'
import { TextEmbeddingPanel } from '@/components/dashboard/panels/text-embedding/text-embedding-panel'

export const metadata: Metadata = {
  title: 'Text Embedding',
}

export default function TextEmbeddingPage() {
  return <TextEmbeddingPanel />
}
