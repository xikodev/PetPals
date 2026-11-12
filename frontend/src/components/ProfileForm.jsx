import { useState } from 'react'

const MAX_NAME_LENGTH = 100
const MAX_URL_LENGTH = 2048

// Returns an error message, or null when the photo URL is acceptable.
// The backend only accepts an HTTPS URL without credentials (or null).
function photoUrlError(value) {
  if (value.length > MAX_URL_LENGTH) return 'Photo URL is too long.'
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) {
      return 'Photo URL must start with https://'
    }
  } catch {
    return 'Photo URL is not a valid address.'
  }
  return null
}

// Presentational form: it knows nothing about the API.
// `profile` is the saved data, `onSave(changes)` receives only the changed fields.
export default function ProfileForm({ profile, onSave, saving = false }) {
  const [firstName, setFirstName] = useState(profile.first_name)
  const [lastName, setLastName] = useState(profile.last_name)
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const first = firstName.trim()
    const last = lastName.trim()
    const photo = photoUrl.trim()

    if (!first || !last) {
      setError('First name and last name are required.')
      return
    }
    if (first.length > MAX_NAME_LENGTH || last.length > MAX_NAME_LENGTH) {
      setError(`Names can have at most ${MAX_NAME_LENGTH} characters.`)
      return
    }
    if (photo) {
      const problem = photoUrlError(photo)
      if (problem) {
        setError(problem)
        return
      }
    }

    // Send only what changed: the backend rejects an empty update.
    const changes = {}
    if (first !== profile.first_name) changes.first_name = first
    if (last !== profile.last_name) changes.last_name = last
    if (photo !== (profile.photo_url ?? '')) changes.photo_url = photo || null

    if (Object.keys(changes).length === 0) {
      setError('Nothing to save: you have not changed anything.')
      return
    }

    setError('')
    setFirstName(first)
    setLastName(last)
    setPhotoUrl(photo)
    onSave(changes)
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <label>
        First name
        <input
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </label>

      <label>
        Last name
        <input
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </label>

      <p className="profile-form-hint">
        Changing your name sets your verification back to pending.
      </p>

      <label>
        Photo URL (optional)
        <input
          type="url"
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="https://example.com/me.jpg"
        />
      </label>

      <label>
        Email
        <input type="email" value={profile.email} readOnly disabled />
      </label>
      <p className="profile-form-hint">Your email comes from Google and cannot be changed.</p>

      {error && (
        <p className="profile-message profile-message-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
