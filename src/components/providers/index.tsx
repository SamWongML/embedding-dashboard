'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from './theme-provider'
import { QueryProvider } from './query-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="embedding-dashboard-theme">
      <QueryProvider>
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
