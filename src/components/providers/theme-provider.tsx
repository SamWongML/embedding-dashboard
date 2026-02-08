'use client'

import * as React from 'react'
import { isTheme, THEME_COOKIE_NAME, THEME_STORAGE_KEY, type Theme } from '@/lib/preferences/theme'

function readThemeCookie(): Theme | null {
  const cookieEntry = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${THEME_COOKIE_NAME}=`))

  if (!cookieEntry) {
    return null
  }

  const [, rawValue = ''] = cookieEntry.split('=')
  const decodedValue = decodeURIComponent(rawValue)
  return isTheme(decodedValue) ? decodedValue : null
}

function persistTheme(theme: Theme, storageKey: string) {
  localStorage.setItem(storageKey, theme)
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; Path=/; Max-Age=31536000; SameSite=Lax`
}

function readStoredTheme(storageKey: string): Theme | null {
  const value = localStorage.getItem(storageKey)
  if (isTheme(value)) {
    return value
  }

  return readThemeCookie()
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme
    }

    return readStoredTheme(storageKey) ?? defaultTheme
  })
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light')

  const setTheme = React.useCallback((newTheme: Theme) => {
    persistTheme(newTheme, storageKey)
    setThemeState(newTheme)
  }, [storageKey])

  React.useEffect(() => {
    const localTheme = localStorage.getItem(storageKey)
    if (!isTheme(localTheme)) {
      return
    }

    const cookieTheme = readThemeCookie()
    if (cookieTheme === localTheme) {
      return
    }

    persistTheme(localTheme, storageKey)
  }, [storageKey])

  React.useEffect(() => {
    let active = true

    fetch('/api/preferences')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active || !isTheme(data?.theme)) return

        // Keep explicit client preference stable across refreshes.
        const hasStoredPreference = readStoredTheme(storageKey) !== null
        if (hasStoredPreference) return

        persistTheme(data.theme, storageKey)
        setThemeState(data.theme)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [storageKey])

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let resolved: 'light' | 'dark'
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolved = theme
    }

    root.classList.add(resolved)
    root.classList.add('theme-transition')
    setResolvedTheme(resolved)

    const timeoutId = window.setTimeout(() => {
      root.classList.remove('theme-transition')
    }, 200)

    return () => {
      window.clearTimeout(timeoutId)
      root.classList.remove('theme-transition')
    }
  }, [theme])

  React.useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      const resolved = e.matches ? 'dark' : 'light'
      root.classList.add(resolved)
      root.classList.add('theme-transition')
      setResolvedTheme(resolved)

      window.setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 200)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
