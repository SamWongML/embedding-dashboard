import { describe, expect, it } from 'vitest'
import { toActionErrorMessage, toNoOpActionMessage } from '@/lib/api/error-feedback'
import { API_BASE_URL, ApiError } from '@/lib/api/client'

describe('error feedback helpers', () => {
  it('formats ApiError messages with status details', () => {
    const message = toActionErrorMessage(
      new ApiError('Server rejected the request', 422),
      'Unable to complete action.'
    )

    expect(message).toContain('Server rejected the request (HTTP 422).')
    expect(message).toContain('NEXT_PUBLIC_DEV_API_SCENARIO')
  })

  it('formats network failures with API base URL context', () => {
    const message = toActionErrorMessage(
      new Error('Failed to fetch'),
      'Unable to load data.'
    )

    expect(message).toContain(`API is unreachable at ${API_BASE_URL}.`)
    expect(message).toContain('Unable to load data.')
  })

  it('formats no-op action messages', () => {
    expect(toNoOpActionMessage('Save changes')).toBe(
      'Save changes is not wired to backend APIs yet.'
    )
  })
})

