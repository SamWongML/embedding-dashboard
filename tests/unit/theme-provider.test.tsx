import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider'
import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '@/lib/preferences/theme'

function ThemeProbe() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
    </div>
  )
}

describe('ThemeProvider', () => {
  const fetchMock = vi.fn()

  function clearThemeCookie() {
    document.cookie = `${THEME_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    localStorage.clear()
    clearThemeCookie()
    document.documentElement.classList.remove('light', 'dark')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    clearThemeCookie()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('keeps a stored light theme when API returns system defaults', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ theme: 'system' }),
    })

    render(
      <ThemeProvider defaultTheme="system" storageKey={THEME_STORAGE_KEY}>
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/preferences')
    })

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
    })

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    expect(document.documentElement).toHaveClass('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=light`)
  })

  it('applies API theme when no local theme is stored', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ theme: 'dark' }),
    })

    render(
      <ThemeProvider defaultTheme="system" storageKey={THEME_STORAGE_KEY}>
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=dark`)
  })

  it('uses cookie theme when local storage is empty', async () => {
    document.cookie = `${THEME_COOKIE_NAME}=light; Path=/; SameSite=Lax`
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ theme: 'system' }),
    })

    render(
      <ThemeProvider defaultTheme="system" storageKey={THEME_STORAGE_KEY}>
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
    })

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    expect(document.documentElement).toHaveClass('light')
  })
})
