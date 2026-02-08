'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { DevApiSimulationProvider } from './dev-api-simulation-provider'
import { ThemeProvider } from './theme-provider'
import { QueryProvider } from './query-provider'
import type { Theme } from '@/lib/preferences/theme'

interface ProvidersProps {
  children: React.ReactNode
  initialTheme?: Theme
}

export function Providers({ children, initialTheme = 'system' }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme={initialTheme}>
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
