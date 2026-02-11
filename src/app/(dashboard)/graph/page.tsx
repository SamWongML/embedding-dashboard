import { Metadata } from 'next'
import GraphPageClient from './graph-page-client'

export const metadata: Metadata = {
  title: 'Graph',
}

export default function GraphPage() {
  return <GraphPageClient />
}
