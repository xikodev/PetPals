import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/auth.js'
import { getMyProfile, updateMyProfile } from '../api/profile.js'
import ProfileForm from '../components/ProfileForm.jsx'
import './ProfilePage.css'

const ROLE_LABELS = {
  owner: 'Pet owner',
  helper: 'Pet helper',
  administrator: 'Administrator',
}

const VERIFICATION_LABELS = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [status, setStatus] = useState('loading')
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getMyProfile()
        if (!active) return
        setProfile(data.profile)
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

  async function handleSave(changes) {
    setSaving(true)
    setMessage(null)
    try {
      const result = await updateMyProfile(changes)
      setProfile(result.profile)
      setMessage({ type: 'success', text: 'Profile saved.' })
      return true
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      setLogoutError(error.message)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <section className="profile-page">
      <h1>My profile</h1>
      {status === 'loading' && <p>Loading your profile…</p>}
      {status === 'error' && <p role="alert">Could not load your profile. Please try again later.</p>}
      {profile && (
        <div className="profile-panel">
          <dl className="profile-summary">
            <dt>Role</dt>
            <dd>{ROLE_LABELS[profile.role] ?? profile.role}</dd>
            <dt>Verification</dt>
            <dd>
              {VERIFICATION_LABELS[profile.verification_status] ?? profile.verification_status}
            </dd>
          </dl>

          <ProfileForm profile={profile} onSave={handleSave} saving={saving} />

          {message && (
            <p
              className={`profile-message profile-message-${message.type}`}
              role={message.type === 'error' ? 'alert' : 'status'}
            >
              {message.text}
            </p>
          )}
        </div>
      )}
      <footer className="profile-footer">
        <button className="profile-logout" type="button" onClick={handleLogout} disabled={loggingOut}>
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
          {loggingOut ? 'Signing out…' : 'Log out'}
        </button>
        {logoutError && <p className="profile-message profile-message-error" role="alert">{logoutError}</p>}
      </footer>
    </section>
  )
}
