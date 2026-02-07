import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveThemePreference } from '@/lib/preferences/preferences'

describe('preferences', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('posts theme preference', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    await saveThemePreference('dark')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/preferences',
      expect.objectContaining({
        method: 'POST',
      })
    )
  })

  it('throws on network failures', async () => {
    fetchMock.mockRejectedValue(new Error('network'))
    await expect(saveThemePreference('light')).rejects.toThrow('network')
  })

  it('throws when API responds with an error payload', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    })

    await expect(saveThemePreference('light')).rejects.toThrow('Unauthorized')
  })
})
