'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardMainClient } from './dashboard-main-client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Sidebar.Provider>
      <div className="min-h-screen bg-background">
        <Sidebar.Frame>
          <Sidebar.Header />
          <Sidebar.Nav />
          <Sidebar.Footer />
        </Sidebar.Frame>
        <DashboardMainClient>
          {children}
        </DashboardMainClient>
      </div>
    </Sidebar.Provider>
  )
}
