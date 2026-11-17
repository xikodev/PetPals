import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { getCurrentUser } from './api/auth.js'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import RequireLogin from './components/RequireLogin.jsx'
import MyListingsPage from './pages/MyListingsPage.jsx'
import MyPetsPage from './pages/MyPetsPage.jsx'

function Layout() {
  const { pathname } = useLocation()
  const [session, setSession] = useState(null)
  const status = session?.pathname === pathname ? session.status : 'loading'

  useEffect(() => {
    let active = true

    getCurrentUser().then(
      user => {
        if (active) setSession({ pathname, status: user ? 'authenticated' : 'guest' })
      },
      () => {
        if (active) setSession({ pathname, status: 'error' })
      },
    )

    return () => { active = false }
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link className="brand" to="/"><i className="fa-solid fa-paw" aria-hidden="true" />PetPals</Link>
          <div className="nav-links">
            {status === 'authenticated' ? (
              <>
                <NavLink to="/profile">My profile</NavLink>
                <NavLink to="/my-pets">My pets</NavLink>
                <NavLink to="/my-listings">My listings</NavLink>
              </>
            ) : (
              <NavLink className="nav-signin" to="/login"><i className="fa-brands fa-google" aria-hidden="true" /><span>Sign in</span></NavLink>
            )}
          </div>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet context={{ status }} />
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegistrationPage />} />

        <Route element={<RequireLogin />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-pets" element={<MyPetsPage />} />
          <Route path="my-listings" element={<MyListingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
