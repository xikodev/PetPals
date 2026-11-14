import { useRef, useState } from 'react'
import { prepareProfilePhoto } from '../api/photo.js'

const MAX_NAME_LENGTH = 100

export default function ProfileForm({ profile, onSave, saving = false }) {
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(profile.first_name)
  const [lastName, setLastName] = useState(profile.last_name)
  // undefined preserves the saved photo; null removes it; a string replaces it.
  const [photo, setPhoto] = useState(undefined)
  const [preparingPhoto, setPreparingPhoto] = useState(false)
  const [failedImage, setFailedImage] = useState(null)
  const [error, setError] = useState('')
  const fileInput = useRef(null)
  const preview = photo === undefined ? profile.photo_url : photo
  const busy = saving || preparingPhoto

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPreparingPhoto(true)
    setError('')
    try {
      setPhoto(await prepareProfilePhoto(file))
      setFailedImage(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setPreparingPhoto(false)
    }
  }

  function handleCancel() {
    setFirstName(profile.first_name)
    setLastName(profile.last_name)
    setPhoto(undefined)
    setError('')
    setEditing(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!editing || busy) return
    const first = firstName.trim()
    const last = lastName.trim()
    if (!first || !last) {
      setError('First name and last name are required.')
      return
    }
    if (first.length > MAX_NAME_LENGTH || last.length > MAX_NAME_LENGTH) {
      setError(`Names can have at most ${MAX_NAME_LENGTH} characters.`)
      return
    }
    const changes = {}
    if (first !== profile.first_name) changes.first_name = first
    if (last !== profile.last_name) changes.last_name = last
    if (photo === null && profile.photo_url) changes.photo_url = null
    else if (typeof photo === 'string') changes.photo_data = photo

    if (!Object.keys(changes).length) {
      setError('Nothing to save: you have not changed anything.')
      return
    }
    setError('')
    setFirstName(first)
    setLastName(last)
    if (await onSave(changes)) {
      setPhoto(undefined)
      setEditing(false)
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={busy}>
        <div className="profile-photo-editor">
          <button className="profile-photo-button" type="button" onClick={() => fileInput.current.click()} aria-label="Change profile photo" disabled={!editing}>
            {preview && failedImage !== preview ? (
              <img src={preview} alt="Your profile photo" onError={() => setFailedImage(preview)} />
            ) : (
              <i className="fa-solid fa-user" aria-hidden="true" />
            )}
            {editing && <span className="photo-camera"><i className="fa-solid fa-camera" aria-hidden="true" /></span>}
          </button>
          <div className="profile-photo-controls" hidden={!editing}>
            {preparingPhoto && <p role="status">Preparing photo…</p>}
            {preview && <button type="button" className="remove-photo" onClick={() => setPhoto(null)}>Remove photo</button>}
            <p>JPEG, PNG or WebP. Up to 5 MB.</p>

          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} aria-label="Choose profile photo" hidden />
        </div>

        <div className="profile-name-fields">
          <label>First name
            <input type="text" value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={MAX_NAME_LENGTH} readOnly={!editing} required />
          </label>
          <label>Last name
            <input type="text" value={lastName} onChange={event => setLastName(event.target.value)} maxLength={MAX_NAME_LENGTH} readOnly={!editing} required />
          </label>
        </div>
        {editing && <p className="profile-form-hint">Changing your name sets your verification back to pending.</p>}
        <label>Email
          <input type="email" value={profile.email} readOnly disabled />
        </label>
        <p className="profile-form-hint">Your email comes from Google and cannot be changed.</p>
      </fieldset>
      {error && <p className="profile-message profile-message-error" role="alert">{error}</p>}
      {editing ? (
        <div className="profile-form-actions">
          <button type="submit" disabled={busy}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button type="button" onClick={handleCancel} disabled={busy}>Cancel</button>
        </div>
      ) : (
        <button key="edit" type="button" onClick={() => setEditing(true)}>Edit profile</button>
      )}
    </form>
  )
}
