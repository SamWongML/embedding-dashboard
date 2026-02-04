export async function saveThemePreference(theme: 'light' | 'dark' | 'system') {
  try {
    await fetch('/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    })
  } catch {
    return
  }
}
