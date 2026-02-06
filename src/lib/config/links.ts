function normalize(value?: string) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const DOCS_URL = normalize(process.env.NEXT_PUBLIC_DOCS_URL)
export const SUPPORT_URL = normalize(process.env.NEXT_PUBLIC_SUPPORT_URL)
export const SHORTCUTS_URL = normalize(process.env.NEXT_PUBLIC_SHORTCUTS_URL)
