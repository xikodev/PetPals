import { useEffect, useState } from 'react'
import { createPet, deletePet, getMyPets, updatePet } from '../api/pets.js'
import PetForm from '../components/PetForm.jsx'
import './MyPetsPage.css'

// The age is calculated from the birth date; it is not stored.
function formatAge(birthDate) {
  const birth = new Date(`${birthDate}T00:00:00`)
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 1) return 'less than a month old'
  if (months < 24) return `${months} month${months === 1 ? '' : 's'} old`
  return `${Math.floor(months / 12)} years old`
}

// Shows the pet photo, or a paw icon when the image cannot be loaded.
function PetPhoto({ pet }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="pet-photo pet-photo-fallback">
        <i className="fa-solid fa-paw" aria-hidden="true" />
      </div>
    )
  }
  return (
    <img
      className="pet-photo"
      src={pet.photo_url}
      alt={pet.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function MyPetsPage() {
  const [status, setStatus] = useState('loading')
  const [pets, setPets] = useState([])
  // null = no form, 'add' = add form, or the pet being edited.
  const [editing, setEditing] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getMyPets()
        if (!active) return
        setPets(data)
        setStatus('ready')
      } catch {
        if (active) setStatus('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function handleSave(values) {
    setBusy(true)
    setMessage(null)
    try {
      if (editing === 'add') {
        const created = await createPet(values)
        setPets((current) => [created, ...current])
        setMessage({ type: 'success', text: `${created.name} was added.` })
      } else {
        const updated = await updatePet(editing.id, values)
        setPets((current) => current.map((pet) => (pet.id === updated.id ? updated : pet)))
        setMessage({ type: 'success', text: `${updated.name} was saved.` })
      }
      setEditing(null)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(pet) {
    setBusy(true)
    setMessage(null)
    try {
      await deletePet(pet.id)
      setPets((current) => current.filter((item) => item.id !== pet.id))
      setConfirmingId(null)
      setMessage({ type: 'success', text: `${pet.name} was deleted.` })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return <p>Loading your pets…</p>
  if (status === 'error') {
    return <p role="alert">Could not load your pets. Please try again later.</p>
  }

  return (
    <section className="pets-page">
      <div className="pets-header">
        <h1>My pets</h1>
        {editing === null && (
          <button
            type="button"
            className="pets-button pets-button-primary"
            onClick={() => {
              setMessage(null)
              setConfirmingId(null)
              setEditing('add')
            }}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" /> Add pet
          </button>
        )}
      </div>

      {message && (
        <p
          className={`pets-message pets-message-${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}

      {editing !== null && (
        <PetForm
          key={editing === 'add' ? 'add' : editing.id}
          pet={editing === 'add' ? undefined : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={busy}
        />
      )}

      {pets.length === 0 ? (
        editing === null && <p className="pets-empty">You have not added any pets yet.</p>
      ) : (
        <ul className="pets-list">
          {pets.map((pet) => (
            <li key={pet.id} className="pet-card">
              <PetPhoto pet={pet} />
              <div className="pet-details">
                <h2>{pet.name}</h2>
                <p className="pet-meta">
                  {pet.species}
                  {pet.breed ? ` · ${pet.breed}` : ''} · {formatAge(pet.birth_date)}
                </p>
                {pet.care_notes && <p className="pet-notes">{pet.care_notes}</p>}

                {confirmingId === pet.id ? (
                  <div className="pet-actions" role="group" aria-label={`Confirm deleting ${pet.name}`}>
                    <span>Delete {pet.name}?</span>
                    <button
                      type="button"
                      className="pets-button pets-button-danger"
                      onClick={() => handleDelete(pet)}
                      disabled={busy}
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      className="pets-button"
                      onClick={() => setConfirmingId(null)}
                      disabled={busy}
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="pet-actions">
                    <button
                      type="button"
                      className="pets-button"
                      onClick={() => {
                        setMessage(null)
                        setConfirmingId(null)
                        setEditing(pet)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="pets-button"
                      onClick={() => {
                        setMessage(null)
                        setEditing(null)
                        setConfirmingId(pet.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
