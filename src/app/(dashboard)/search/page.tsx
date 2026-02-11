import { Metadata } from 'next'
import { SearchPanel } from '@/components/dashboard/panels/search/search-panel'

export const metadata: Metadata = {
  title: 'Hybrid Search',
}

export default function SearchPage() {
  return <SearchPanel />
}
