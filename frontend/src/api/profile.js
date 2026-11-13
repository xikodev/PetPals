import { getCurrentSession } from './auth.js'

export async function getMyProfile() {
  const response = await fetch('/api/users/me', {
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`Could not load your profile (${response.status})`)
  }

  return response.json()
}

export async function updateMyProfile(changes) {
  const session = await getCurrentSession()

  if (!session) {
    throw new Error('You need to be logged in to edit your profile.')
  }

  if (!session.csrfToken) {
    throw new Error('The security token for editing your profile is missing.')
  }

  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': session.csrfToken,
    },
    body: JSON.stringify(changes),
  })

  if (!response.ok) {
    throw new Error(`Could not save your profile (${response.status})`)
  }

  return response.json()
}