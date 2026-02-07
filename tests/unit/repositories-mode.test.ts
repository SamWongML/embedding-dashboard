import { afterEach, describe, expect, it, vi } from 'vitest'

const originalDataMode = process.env.NEXT_PUBLIC_DATA_MODE

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_MODE = originalDataMode
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('metrics repository factory', () => {
  it('selects api repository by default', async () => {
    delete process.env.NEXT_PUBLIC_DATA_MODE
    vi.resetModules()

    const { getDemoMetricsOverview } = await import('@/mocks')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getDemoMetricsOverview('24h'),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { getMetricsRepository } = await import('@/lib/repositories/metrics')
    const repository = getMetricsRepository()
    const overview = await repository.getOverview('24h')

    expect(fetchMock).toHaveBeenCalled()
    expect(overview.cards.length).toBeGreaterThan(0)
  })

  it('selects demo repository when configured', async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'demo'
    vi.resetModules()

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { getMetricsRepository } = await import('@/lib/repositories/metrics')
    const repository = getMetricsRepository()
    const overview = await repository.getOverview('24h')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(overview.topHits.length).toBeGreaterThan(0)
  })
})
