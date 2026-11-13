import { useEffect, useState } from 'react'
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
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <p>Loading your profile…</p>
  if (status === 'error') {
    return <p role="alert">Could not load your profile. Please try again later.</p>
  }

  return (
    <section className="profile-page">
      <h1>My profile</h1>

      <dl className="profile-summary">
        <dt>Name</dt>
        <dd>
          {profile.first_name} {profile.last_name}
        </dd>
        <dt>Email</dt>
        <dd>{profile.email}</dd>
        <dt>Role</dt>
        <dd>{ROLE_LABELS[profile.role] ?? profile.role}</dd>
        <dt>Verification</dt>
        <dd>
          {VERIFICATION_LABELS[profile.verification_status] ?? profile.verification_status}
        </dd>
      </dl>

      <h2>Edit profile</h2>
      <ProfileForm profile={profile} onSave={handleSave} saving={saving} />

      {message && (
        <p
          className={`profile-message profile-message-${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}
    </section>
  )
}
