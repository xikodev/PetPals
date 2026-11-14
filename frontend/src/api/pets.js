// Mock for the pet endpoints until the backend has them:
//   GET /api/pets, POST /api/pets, PATCH /api/pets/:id, DELETE /api/pets/:id
// Pets live in memory only, so they are lost when the page is reloaded.
// Fields follow the `pets` table: name, species, breed?, birth_date, care_notes?, photo_url.
// photo_url is a (resized) data URL here, because the photo is chosen from the device.

let pets = []
let nextId = 1

const wait = () => new Promise((resolve) => setTimeout(resolve, 150))

function clean(values) {
  const pet = {
    name: (values.name ?? '').trim(),
    species: (values.species ?? '').trim(),
    breed: (values.breed ?? '').trim() || null,
    birth_date: values.birth_date ?? '',
    care_notes: (values.care_notes ?? '').trim() || null,
    photo_url: values.photo_url ?? '',
  }
  if (!pet.name || !pet.species || !pet.birth_date || !pet.photo_url) {
    throw new Error('Name, species, birth date and a photo are required.')
  }
  return pet
}

export async function getMyPets() {
  await wait()
  // Newest first, like the backend will return them.
  return [...pets].sort((a, b) => b.id - a.id)
}

export async function createPet(values) {
  await wait()
  const pet = { id: nextId++, ...clean(values) }
  pets = [...pets, pet]
  return pet
}

export async function updatePet(id, values) {
  await wait()
  const index = pets.findIndex((pet) => pet.id === id)
  if (index === -1) throw new Error('Pet not found.')
  const updated = { ...pets[index], ...clean(values) }
  pets = pets.map((pet) => (pet.id === id ? updated : pet))
  return updated
}

export async function deletePet(id) {
  await wait()
  if (!pets.some((pet) => pet.id === id)) throw new Error('Pet not found.')
  pets = pets.filter((pet) => pet.id !== id)
}
