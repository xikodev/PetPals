import './LoginPage.css'

// Relative path on purpose: Vite proxies /api to the backend in development.
export const GOOGLE_LOGIN_URL = '/api/auth/google'

export default function LoginPage() {
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
