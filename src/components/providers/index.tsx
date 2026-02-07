'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { DevApiSimulationProvider } from './dev-api-simulation-provider'
import { ThemeProvider } from './theme-provider'
import { QueryProvider } from './query-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="embedding-dashboard-theme">
      <DevApiSimulationProvider>
        <QueryProvider>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
        </QueryProvider>
      </DevApiSimulationProvider>
    </ThemeProvider>
  )
}
