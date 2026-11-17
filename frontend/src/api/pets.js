import { getCurrentSession } from './auth.js'

async function request(path = '', method = 'GET', values) {
  const headers = {}
  if (method !== 'GET') {
    const session = await getCurrentSession()
    if (!session?.user || !session.csrfToken) throw new Error('Sign in before managing your pets.')
    headers['X-CSRF-Token'] = session.csrfToken
  }
  if (values !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(`/api/pets${path}`, {
    method,
    credentials: 'same-origin',
    headers,
    body: values === undefined ? undefined : JSON.stringify(values),
  })
  if (response.status === 204) return
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || `Could not ${method === 'GET' ? 'load' : 'save'} your pets (${response.status}).`)
  return result
}

export async function getMyPets() {
  return (await request()).pets
}

export async function createPet(values) {
  return (await request('', 'POST', values)).pet
}

export async function updatePet(id, values) {
  return (await request(`/${encodeURIComponent(id)}`, 'PATCH', values)).pet
}

export async function deletePet(id) {
  await request(`/${encodeURIComponent(id)}`, 'DELETE')
}
