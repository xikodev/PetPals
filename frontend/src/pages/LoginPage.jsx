import './LoginPage.css'

// Relative path on purpose: Vite proxies /api to the backend in development.
export const GOOGLE_LOGIN_URL = '/api/auth/google'

export default function LoginPage() {
  return (
    <main className="login-page">
      <h1>Pet Pals</h1>
      <p>Sign in to find pet helpers or offer your care services.</p>
      {/* A plain link, not fetch: login is a full-page redirect to Google. */}
      <a className="login-button" href={GOOGLE_LOGIN_URL}>
        Sign in with Google
      </a>
    </main>
  )
}
