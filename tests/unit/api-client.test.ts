import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as z from 'zod'
import { api, ApiError, API_BASE_URL } from '@/lib/api/client'

describe('api client', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('performs GET requests', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })

    const result = await api.get<{ ok: boolean }>('/health')

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/health`,
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('throws ApiError when response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Boom' }),
    })

    await expect(api.get('/fail')).rejects.toBeInstanceOf(ApiError)
  })

  it('validates responses with schema', async () => {
    const schema = z.object({ ok: z.boolean() })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })

    await expect(api.get('/valid', schema)).resolves.toEqual({ ok: true })
  })

  it('throws ApiError on invalid schema response', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const schema = z.object({ ok: z.boolean() })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: 'nope' }),
    })

    await expect(api.get('/invalid', schema)).rejects.toBeInstanceOf(ApiError)
    consoleSpy.mockRestore()
  })

  it('supports write methods', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })

    await api.post('/items', { name: 'Item' })
    await api.put('/items/1', { name: 'Item' })
    await api.patch('/items/1', { name: 'Item' })
    await api.delete('/items/1')

    expect(fetchMock).toHaveBeenCalled()
  })
})
