export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'embedding-dashboard-theme'
export const THEME_COOKIE_NAME = 'embedding-dashboard-theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}
