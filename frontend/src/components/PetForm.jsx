import { useRef, useState } from 'react'
import { prepareProfilePhoto } from '../api/photo.js'

const MAX_TEXT_LENGTH = 100
const MAX_NOTES_LENGTH = 1000

// Presentational form for adding or editing a pet. It knows nothing about the API:
// `pet` is the saved pet when editing (omit it when adding),
// `onSave(values)` receives the trimmed values, `onCancel()` closes the form.
export default function PetForm({ pet, onSave, onCancel, saving = false }) {
  const [name, setName] = useState(pet?.name ?? '')
  const [species, setSpecies] = useState(pet?.species ?? '')
  const [breed, setBreed] = useState(pet?.breed ?? '')
  const [birthDate, setBirthDate] = useState(pet?.birth_date ?? '')
  const [careNotes, setCareNotes] = useState(pet?.care_notes ?? '')
  // undefined keeps the saved photo; a string replaces it.
  const [photo, setPhoto] = useState(undefined)
  const [preparingPhoto, setPreparingPhoto] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  const today = new Date().toISOString().slice(0, 10)
  const preview = photo ?? pet?.photo_url ?? ''
  const busy = saving || preparingPhoto

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPreparingPhoto(true)
    setError('')
    try {
      setPhoto(await prepareProfilePhoto(file))
    } catch (problem) {
      setError(problem.message)
    } finally {
      setPreparingPhoto(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    const values = {
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      birth_date: birthDate,
      care_notes: careNotes.trim(),
      photo_url: preview,
    }

    if (!values.name || !values.species || !values.birth_date) {
      setError('Name, species and birth date are required.')
      return
    }
    if (!values.photo_url) {
      setError('Add a photo of your pet.')
      return
    }
    if (
      values.name.length > MAX_TEXT_LENGTH ||
      values.species.length > MAX_TEXT_LENGTH ||
      values.breed.length > MAX_TEXT_LENGTH
    ) {
      setError(`Name, species and breed can have at most ${MAX_TEXT_LENGTH} characters.`)
      return
    }
    if (values.birth_date > today) {
      setError('Birth date cannot be in the future.')
      return
    }
    if (values.care_notes.length > MAX_NOTES_LENGTH) {
      setError(`Care notes can have at most ${MAX_NOTES_LENGTH} characters.`)
      return
    }

    setError('')
    onSave(values)
  }

  return (
    <form className="pet-form" onSubmit={handleSubmit} noValidate>
      <h2>{pet ? `Edit ${pet.name}` : 'Add a pet'}</h2>

      <fieldset disabled={busy}>
        <div className="pet-photo-editor">
          <div className="pet-photo-preview">
            {preview ? (
              <img src={preview} alt="Selected pet" />
            ) : (
              <i className="fa-solid fa-paw" aria-hidden="true" />
            )}
          </div>
          <div className="pet-photo-controls">
            <button type="button" className="pets-button" onClick={() => fileInput.current.click()}>
              <i className="fa-solid fa-camera" aria-hidden="true" /> {preview ? 'Change photo' : 'Choose photo'}
            </button>
            {preparingPhoto && <p role="status">Preparing photo…</p>}
            <p className="pet-form-hint">A photo is required. JPEG, PNG or WebP, up to 5 MB.</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            aria-label="Choose pet photo"
            hidden
          />
        </div>

        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            required
          />
        </label>

        <label>
          Species
          <input
            type="text"
            value={species}
            onChange={(event) => setSpecies(event.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Dog, cat, rabbit…"
            required
          />
        </label>

        <label>
          Breed (optional)
          <input
            type="text"
            value={breed}
            onChange={(event) => setBreed(event.target.value)}
            maxLength={MAX_TEXT_LENGTH}
          />
        </label>

        <label>
          Birth date
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            max={today}
            required
          />
        </label>
        <p className="pet-form-hint">An approximate date is fine if you do not know it exactly.</p>

        <label>
          Care notes (optional)
          <textarea
            value={careNotes}
            onChange={(event) => setCareNotes(event.target.value)}
            maxLength={MAX_NOTES_LENGTH}
            rows={3}
            placeholder="Medication, fears, feeding times…"
          />
        </label>
      </fieldset>

      {error && (
        <p className="pets-message pets-message-error" role="alert">
          {error}
        </p>
      )}

      <div className="pet-form-actions">
        <button type="submit" className="pets-button pets-button-primary" disabled={busy}>
          {saving ? 'Saving…' : pet ? 'Save changes' : 'Add pet'}
        </button>
        <button type="button" className="pets-button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  )
}
