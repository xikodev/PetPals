import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getCurrentSession, register } from '../api/auth.js'
import './ProfilePage.css'

export default function RegistrationPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCurrentSession().then(result => {
      if (!active) return
      setSession(result)
      setFirstName(result?.profile?.first_name || '')
      setLastName(result?.profile?.last_name || '')
    }).catch(error => {
      if (active) setError(error.message)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await register({ first_name: firstName.trim(), last_name: lastName.trim(), role }, session.csrfToken)
      navigate('/profile', { replace: true })
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p role="status">Loading registration…</p>
  if (session?.user) return <Navigate to="/profile" replace />

  return (
    <section className="profile-page">
      <h1>Create your PetPals account</h1>
      {session?.registrationRequired ? (
        <div className="profile-panel">
          <p>Confirm your name and choose how you want to use PetPals.</p>
          <form className="profile-form" onSubmit={handleSubmit}>
            <fieldset disabled={saving}>
              <div className="profile-name-fields">
                <label>First name
                  <input autoComplete="given-name" value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={100} required />
                </label>
                <label>Last name
                  <input autoComplete="family-name" value={lastName} onChange={event => setLastName(event.target.value)} maxLength={100} required />
                </label>
              </div>
              <label>Email
                <input type="email" value={session.profile.email} readOnly />
              </label>
              <label>Account type
                <select value={role} onChange={event => setRole(event.target.value)} required>
                  <option value="" disabled>Choose an account type</option>
                  <option value="owner">Owner — find care for my pets</option>
                  <option value="helper">Helper — help care for pets</option>
                </select>
              </label>
              <p>Your account will be pending verification after registration.</p>
              <button type="submit">{saving ? 'Creating account…' : 'Create account'}</button>
            </fieldset>
            {error && <p className="profile-message profile-message-error" role="alert">{error}</p>}
          </form>
          <p><a href="/api/auth/google">Start Google sign-in again</a></p>
        </div>
      ) : (
        <>
          {error && <p role="alert">{error}</p>}
          <p>Sign in with Google to start or resume registration.</p>
          <Link to="/login">Go to sign in</Link>
        </>
      )}
    </section>
  )
}
