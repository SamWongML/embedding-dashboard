const REM_FALLBACK_PX = 16

function toNumber(value: string): number | null {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveRemBasePx(styles: CSSStyleDeclaration): number {
  const fontSize = toNumber(styles.fontSize)
  return fontSize ?? REM_FALLBACK_PX
}

function parseCssLengthToPx(value: string, remBasePx: number): number | null {
  const normalized = value.trim()
  if (!normalized) return null

  if (normalized.endsWith("px")) {
    return toNumber(normalized)
  }

  if (normalized.endsWith("rem")) {
    const remValue = toNumber(normalized)
    return remValue === null ? null : remValue * remBasePx
  }

  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    return toNumber(normalized)
  }

  return null
}

export function readTypographyPxVar(token: `--${string}`, fallbackPx: number): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallbackPx
  }

  const rootStyles = window.getComputedStyle(document.documentElement)
  const tokenValue = rootStyles.getPropertyValue(token)
  const remBasePx = resolveRemBasePx(rootStyles)
  return parseCssLengthToPx(tokenValue, remBasePx) ?? fallbackPx
}
