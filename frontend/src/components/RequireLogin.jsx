import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getCurrentUser } from '../api/auth.js'

export default function RequireLogin() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    async function checkLogin() {
      try {
        const user = await getCurrentUser()
        if (active) setStatus(user ? 'authenticated' : 'guest')
      } catch {
        if (active) setStatus('error')
      }
    }

    checkLogin()
    return () => {
      active = false
    }
  }, [])

  if (status === 'loading') return <p>Checking your login…</p>
  if (status === 'error') return <p>Could not check your login.</p>
  if (status === 'guest') return <Navigate to="/login" replace />

  return <Outlet />
}