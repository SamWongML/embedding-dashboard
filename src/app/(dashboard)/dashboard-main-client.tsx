'use client'

import { useSidebar } from '@/components/dashboard/sidebar'
import { cn } from '@/lib/utils'

export function DashboardMainClient({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main
      className={cn(
        'h-screen overflow-y-auto transition-all duration-300',
        collapsed ? 'ml-16' : 'ml-64'
      )}
    >
      {children}
    </main>
  )
}
