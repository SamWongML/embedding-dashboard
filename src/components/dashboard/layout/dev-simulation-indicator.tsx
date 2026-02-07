'use client'

import { Badge } from '@/components/ui/badge'
import { useDevApiSimulationScenario } from '@/components/providers/dev-api-simulation-provider'

const scenarioStyles: Record<'success' | 'error' | 'slow', string> = {
  success: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
  error: 'border-destructive/40 text-destructive',
  slow: 'border-amber-500/40 text-amber-700 dark:text-amber-300',
}

export function DevSimulationIndicator() {
  const scenario = useDevApiSimulationScenario()

  if (scenario === 'off') {
    return null
  }

  return (
    <Badge
      variant="outline"
      className={scenarioStyles[scenario]}
      aria-label={`Active API scenario: ${scenario}`}
    >
      Simulated API: {scenario}
    </Badge>
  )
}

