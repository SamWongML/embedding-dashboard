import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import type { AccountSnapshot } from '@/lib/types/account'
import { AccountProvider } from '@/components/account/account-provider'
import { DashboardAppShell } from '@/components/dashboard/layout/dashboard-app-shell'
import { AppSidebar } from '@/components/dashboard/sidebar/app-sidebar'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getAccountSnapshotSupabase } from '@/lib/account/supabase'
import { parseSidebarOpenCookie, SIDEBAR_STATE_COOKIE_NAME } from '@/lib/layout/sidebar-state'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

function getAuthMode() {
  const mode = process.env.AUTH_MODE || process.env.NEXT_PUBLIC_AUTH_MODE || 'mock'
  if (mode === 'supabase' || mode === 'mock') {
    return mode
  }
  return 'mock'
}

async function getInitialSnapshot(): Promise<AccountSnapshot | null> {
  const authMode = getAuthMode()

  if (authMode === 'supabase') {
    const supabase = await getSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      return null
    }
    return getAccountSnapshotSupabase(supabase, authData.user)
  }

  return null
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarStateCookie = cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value
  const defaultSidebarOpen = parseSidebarOpenCookie(sidebarStateCookie)

  let initialSnapshot: AccountSnapshot | null = null

  try {
    initialSnapshot = await getInitialSnapshot()
  } catch {
    initialSnapshot = null
  }

  return (
    <AccountProvider initialSnapshot={initialSnapshot}>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <AppSidebar />
        <SidebarInset className="min-h-svh">
          <DashboardAppShell>{children}</DashboardAppShell>
        </SidebarInset>
      </SidebarProvider>
    </AccountProvider>
  )
}
