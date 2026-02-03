import { Metadata } from 'next'
import { SearchPanel } from '@/components/dashboard/panels/search'

export const metadata: Metadata = {
  title: 'Hybrid Search',
}

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <h1 className="text-lg font-semibold">Hybrid Search</h1>
      </header>
      <div className="flex-1 p-6">
        <SearchPanel />
      </div>
    </div>
  )
}
