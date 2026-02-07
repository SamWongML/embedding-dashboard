export async function saveThemePreference(theme: 'light' | 'dark' | 'system') {
  const response = await fetch('/api/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme }),
  })

  if (!response.ok) {
    let message = 'Unable to persist theme preference.'

    try {
      const payload = (await response.json()) as { error?: string; message?: string }
      message = payload.error || payload.message || message
    } catch {
      // Keep fallback message when response payload is not JSON.
    }

    throw new Error(message)
  }
}
