import { Metadata } from 'next'
import { RecordsPanel } from '@/components/dashboard/panels/records/records-panel'

export const metadata: Metadata = {
  title: 'Records',
}

export default function RecordsPage() {
  return <RecordsPanel />
}
