export type DevApiScenario = 'off' | 'success' | 'error' | 'slow'

const DEFAULT_DEV_API_SCENARIO: DevApiScenario = 'off'
const VALID_SCENARIOS: readonly DevApiScenario[] = [
  'off',
  'success',
  'error',
  'slow',
]

function isDevApiScenario(value: string): value is DevApiScenario {
  return VALID_SCENARIOS.includes(value as DevApiScenario)
}

export function parseDevApiScenario(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const normalized = value.toLowerCase()
  return isDevApiScenario(normalized) ? normalized : null
}

export function resolveDevApiScenario({
  search,
  envScenario = process.env.NEXT_PUBLIC_DEV_API_SCENARIO,
}: {
  search?: string
  envScenario?: string | null
} = {}): DevApiScenario {
  const searchValue = search?.startsWith('?') ? search.slice(1) : search

  if (searchValue) {
    const params = new URLSearchParams(searchValue)
    const queryScenario = parseDevApiScenario(params.get('scenario'))
    if (queryScenario) {
      return queryScenario
    }
  }

  const envResolved = parseDevApiScenario(envScenario)
  return envResolved ?? DEFAULT_DEV_API_SCENARIO
}

export function isDevApiScenarioEnabled(scenario: DevApiScenario) {
  return scenario !== 'off'
}

