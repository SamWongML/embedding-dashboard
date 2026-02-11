import { Metadata } from 'next'
import { UsersPanel } from '@/components/dashboard/panels/users/users-panel'

export const metadata: Metadata = {
  title: 'Users',
}

export default function UsersPage() {
  return <UsersPanel />
}
