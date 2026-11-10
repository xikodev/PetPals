export async function getCurrentUser() {
    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_GUEST === 'true') {
  return null
}
  const response = await fetch('/api/me')

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Provjera prijave nije uspjela (${response.status})`)
  }

  return response.json()
}