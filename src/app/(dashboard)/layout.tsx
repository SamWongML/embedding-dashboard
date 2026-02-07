import type { ReactNode } from 'react'
import type { AccountSnapshot } from '@/lib/types/account'
import { AccountProvider } from '@/components/account/account-provider'
import { AppSidebar } from '@/components/dashboard/sidebar/app-sidebar'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getAccountSnapshotSupabase } from '@/lib/account/supabase'
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
  let initialSnapshot: AccountSnapshot | null = null

  try {
    initialSnapshot = await getInitialSnapshot()
  } catch {
    initialSnapshot = null
  }

  return (
    <AccountProvider initialSnapshot={initialSnapshot}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-svh">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AccountProvider>
  )
}
