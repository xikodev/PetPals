let profile = {
  id: 1,
  first_name: 'Mato',
  last_name: 'Primjer',
  email: 'mato@example.com',
}

export async function getMyProfile() {
  return { ...profile }
}

export async function updateMyProfile({ first_name, last_name }) {
  const firstName = first_name.trim()
  const lastName = last_name.trim()

  if (!firstName || !lastName) {
    throw new Error('First name and last name are required.')
  }

  profile = { ...profile, first_name: firstName, last_name: lastName }
  return { ...profile }
}