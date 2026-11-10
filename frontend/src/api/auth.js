export async function getCurrentUser() {
  const response = await fetch('/api/me')

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Provjera prijave nije uspjela (${response.status})`)
  }

  return response.json()
}