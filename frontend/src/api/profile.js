import { getCurrentSession } from './auth.js'

export async function getMyProfile() {
  const response = await fetch('/api/users/me', {
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`Učitavanje profila nije uspjelo (${response.status})`)
  }

  return response.json()
}

export async function updateMyProfile(changes) {
  const session = await getCurrentSession()

  if (!session) {
    throw new Error('Za izmjenu profila potrebna je prijava.')
  }

  if (!session.csrfToken) {
    throw new Error('Nedostaje sigurnosni token za izmjenu profila.')
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
    throw new Error(`Spremanje profila nije uspjelo (${response.status})`)
  }

  return response.json()
}