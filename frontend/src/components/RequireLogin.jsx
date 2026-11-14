import { Navigate, Outlet, useOutletContext } from 'react-router-dom'

export default function RequireLogin() {
  const { status } = useOutletContext()

  if (status === 'loading') return <p>Checking your login…</p>
  if (status === 'error') return <p>Could not check your login.</p>
  if (status === 'guest') return <Navigate to="/login" replace />

  return <Outlet context={{ status }} />
}
