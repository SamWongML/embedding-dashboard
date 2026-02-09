'use client'

import { Badge } from '@/components/ui/badge'
import { useDevApiSimulationScenario } from '@/components/providers/dev-api-simulation-provider'

const scenarioStyles: Record<'success' | 'error' | 'slow', string> = {
  success: 'border-success/40 text-success',
  error: 'border-destructive/40 text-destructive',
  slow: 'border-warning/40 text-warning',
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

