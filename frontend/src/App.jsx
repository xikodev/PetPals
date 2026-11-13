import { Link, Outlet, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RequireLogin from './components/RequireLogin.jsx'

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">PetPals</Link>{' | '}
        <Link to="/login">Login</Link>{' | '}
        <Link to="/profile">My profile</Link>{' | '}
        <Link to="/my-listings">My listings</Link>
      </nav>

      <main>
        <Outlet />
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

        <Route element={<RequireLogin />}>
          <Route path="profile" element={<h1>My profile</h1>} />
          <Route path="my-listings" element={<h1>My listings</h1>} />
        </Route>
      </Route>
    </Routes>
  )
}