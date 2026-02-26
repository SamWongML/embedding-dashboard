import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ServiceModeProvider,
  useServiceMode,
} from '@/components/providers/service-mode-provider'
import { SERVICE_MODE_STORAGE_KEY } from '@/lib/preferences/service-mode'

function ServiceModeProbe() {
  const { serviceMode, setServiceMode } = useServiceMode()

  return (
    <div>
      <span data-testid="service-mode">{serviceMode}</span>
      <button
        type="button"
        onClick={() => {
          setServiceMode('technical')
        }}
      >
        Set technical mode
      </button>
    </div>
  )
}

describe('ServiceModeProvider', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('defaults to simple mode', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    render(
      <ServiceModeProvider storageKey={SERVICE_MODE_STORAGE_KEY}>
        <ServiceModeProbe />
      </ServiceModeProvider>
    )

    expect(screen.getByTestId('service-mode')).toHaveTextContent('simple')
  })

  it('uses stored local mode when present', async () => {
    localStorage.setItem(SERVICE_MODE_STORAGE_KEY, 'technical')
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ service_mode: 'simple' }),
    })

    render(
      <ServiceModeProvider storageKey={SERVICE_MODE_STORAGE_KEY}>
        <ServiceModeProbe />
      </ServiceModeProvider>
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/preferences')
    })
    expect(screen.getByTestId('service-mode')).toHaveTextContent('technical')
  })

  it('seeds mode from API when no local mode is set', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ service_mode: 'technical' }),
    })

    render(
      <ServiceModeProvider storageKey={SERVICE_MODE_STORAGE_KEY}>
        <ServiceModeProbe />
      </ServiceModeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('service-mode')).toHaveTextContent('technical')
    })
    expect(localStorage.getItem(SERVICE_MODE_STORAGE_KEY)).toBe('technical')
  })

  it('does not overwrite local mode with API mode', async () => {
    localStorage.setItem(SERVICE_MODE_STORAGE_KEY, 'simple')
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ service_mode: 'technical' }),
    })

    render(
      <ServiceModeProvider storageKey={SERVICE_MODE_STORAGE_KEY}>
        <ServiceModeProbe />
      </ServiceModeProvider>
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/preferences')
    })
    expect(screen.getByTestId('service-mode')).toHaveTextContent('simple')
    expect(localStorage.getItem(SERVICE_MODE_STORAGE_KEY)).toBe('simple')
  })

  it('updates mode and local storage when setServiceMode is called', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ service_mode: 'simple' }),
    })

    render(
      <ServiceModeProvider storageKey={SERVICE_MODE_STORAGE_KEY}>
        <ServiceModeProbe />
      </ServiceModeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Set technical mode' }))

    expect(screen.getByTestId('service-mode')).toHaveTextContent('technical')
    expect(localStorage.getItem(SERVICE_MODE_STORAGE_KEY)).toBe('technical')
  })
})
