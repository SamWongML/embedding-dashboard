import { describe, expect, it } from 'vitest'
import { resolveDevApiScenario } from '@/lib/runtime/dev-api-scenario'

describe('resolveDevApiScenario', () => {
  it('prioritizes query parameter over env value', () => {
    expect(
      resolveDevApiScenario({
        search: '?scenario=slow',
        envScenario: 'error',
      })
    ).toBe('slow')
  })

  it('falls back to env value when query parameter is invalid', () => {
    expect(
      resolveDevApiScenario({
        search: '?scenario=invalid',
        envScenario: 'success',
      })
    ).toBe('success')
  })

  it('defaults to off when both query and env values are invalid', () => {
    expect(
      resolveDevApiScenario({
        search: '?scenario=nope',
        envScenario: 'unknown',
      })
    ).toBe('off')
  })
})

