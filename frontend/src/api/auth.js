export async function getCurrentSession() {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_GUEST === 'true') {
    return null
  }

  const response = await fetch('/api/auth/me', {
    credentials: 'same-origin',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Provjera prijave nije uspjela (${response.status})`)
  }

  const session = await response.json()

  if (session.registrationRequired === true) {
    return null
  }

  if (!session.user) {
    throw new Error('U odgovoru nedostaje korisnik.')
  }

  return session
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user ?? null
}