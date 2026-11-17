import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentSession } from '../api/auth.js'
import './LoginPage.css'

// Relative path on purpose: Vite proxies /api to the backend in development.
export const GOOGLE_LOGIN_URL = '/api/auth/google'

export default function LoginPage() {
  const [session, setSession] = useState(null)
  useEffect(() => {
    let active = true
    getCurrentSession().then(result => {
      if (active) setSession(result)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  if (session?.registrationRequired) return <Navigate to="/register" replace />
  if (session?.user) return <Navigate to="/profile" replace />

  return (
    <section className="login-page">
      <h1>Sign in to PetPals</h1>
      <p>Use your Google account to access your PetPals profile.</p>
      {/* A plain link, not fetch: login is a full-page redirect to Google. */}
      <a className="login-button" href={GOOGLE_LOGIN_URL}>
        <i className="fa-brands fa-google" aria-hidden="true" />
        <span>Sign in with Google</span>
      </a>
    </section>
  )
}
