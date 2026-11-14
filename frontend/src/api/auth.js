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
    throw new Error(`Could not check your login (${response.status})`)
  }

  const session = await response.json()

  if (session.registrationRequired === true) {
    return null
  }

  if (!session.user) {
    throw new Error('The response does not contain a user.')
  }

  return session
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user ?? null
}
export async function logout() {
  const session = await getCurrentSession()
  if (!session) return
  if (!session.csrfToken) throw new Error('Could not sign out. Please refresh and try again.')

  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRF-Token': session.csrfToken },
  })
  if (!response.ok) throw new Error('Could not sign out. Please try again.')
}
