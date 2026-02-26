import type { ServiceMode } from '@/lib/preferences/service-mode'

async function savePreferences(payload: Record<string, string | null>, fallbackMessage: string) {
  const response = await fetch('/api/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = fallbackMessage

    try {
      const payload = (await response.json()) as { error?: string; message?: string }
      message = payload.error || payload.message || message
    } catch {
      // Keep fallback message when response payload is not JSON.
    }

    throw new Error(message)
  }
}

export async function saveThemePreference(theme: 'light' | 'dark' | 'system') {
  await savePreferences({ theme }, 'Unable to persist theme preference.')
}

export async function saveServiceModePreference(serviceMode: ServiceMode) {
  await savePreferences(
    { service_mode: serviceMode },
    'Unable to persist service mode preference.'
  )
}
