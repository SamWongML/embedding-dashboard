import { Metadata } from 'next'
import TextEmbeddingPageClient from './text-embedding-page-client'

export const metadata: Metadata = {
  title: 'Text Embedding',
}

export default function TextEmbeddingPage() {
  return <TextEmbeddingPageClient />
}
